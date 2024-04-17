const fs = require("fs")
const path = require("path")
const sharp = require("sharp")
const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const env = process.env.NODE_ENV || 'development';
const { error } = require("console");


// GUI
let win;
const createWindow = () =>{
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        width: 400,
        height: 400,
        frame: false
    })
    win.loadFile('index.html')
}
app.whenReady().then(()=>{
    createWindow()
});


// WORKERS
const getImagesFromPath = (inputPath) => {
    let imagesToEdit = []
    for(let file of fs.readdirSync(inputPath)){
        let fileName = file.toLowerCase()
        if (fileName.endsWith(".jpg") && !(fileName.endsWith("_resized.jpg")) ) {
            imagesToEdit.push(path.join(inputPath, file))
        }
    }
    return imagesToEdit
}


const applyImageTransforms = async (images, downsizeRes, stretchPercent)=>{
    for(let image of images){
        let outName = image.split(".")[0] + "_resized" + "." + image.split(".")[1]
        console.log(`Resizing: ${image} --> ${outName}`)
        await sharp(image)
            .metadata()
            .then(({width, height})=>{
                console.log("Width ", width, "Height", height)
                new sharp(image)
                .resize({
                    fit: "fill",
                    width: Math.round(width * stretchPercent * downsizeRes),
                    height: Math.round(height * downsizeRes)
                })
                .toFile(outName)
            })
    }
    
}


ipcMain.on("images:req", (e, projectPath)=>{
    if (!fs.existsSync(projectPath)){
        alert("This path does not exist, please re-enter a valid path.")
        return;
    }
    let images = getImagesFromPath(projectPath)
    if(!images.length){
        alert("Images folder does not contain any files for resizing.")
        return;
    }
    for(let image of images){
        applyImageTransforms(image)
    }
    win.webContents.send("images:res", images)
})

ipcMain.on("selectDir:req", (e)=>{
    let dir = dialog.showOpenDialogSync({
        properties:["openDirectory"]
    })
    if(dir !== undefined){
        win.webContents.send("selectDir:res", dir);
    }
})

ipcMain.on("closeWindow", ()=>{
    app.exit()
})

ipcMain.on("run", (e, data)=>{
    const images = getImagesFromPath(data.imagesDir);
    try{
        applyImageTransforms(images, data.outputResolution, data.stretchPercentage)
    }
    catch{
        win.webContents.send("run:res", "Failed to convert images.")
    }
    finally{
        win.webContents.send("run:res", "Successfully Applied Image Transforms")
    }
    
})