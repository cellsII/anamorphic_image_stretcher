const {ipcRenderer} = require("electron")
const {dialog} = require("electron")
const projectPathInput = document.getElementById("projectPathInput")
const executeBtn = document.getElementById("executeBtn")
const browseBtn = document.getElementById("fileBrowseBtn");
const stretchPercentageInput = document.getElementById("stretchPercentage")
const outputResolutionInput = document.getElementById("outputResolution")
const closeWindowBtn = document.getElementById("closeWindow")

const defaultStretchValue = squeeze = 1 + 1.5 / 2.39;
const defaultOutputResolution = 60; 

stretchPercentageInput.value = defaultStretchValue;
outputResolutionInput.value = defaultOutputResolution;

closeWindowBtn.addEventListener("click", (e=>{
    ipcRenderer.send("closeWindow")
}))

browseBtn.addEventListener("click", (e)=>{
    ipcRenderer.send("selectDir:req")
    ipcRenderer.once("selectDir:res", (e, dir)=>{
        projectPathInput.value = dir
    })
})

executeBtn.addEventListener("click", ()=>{
    ipcRenderer.send("run", {
        imagesDir: projectPathInput.value,
        stretchPercentage: stretchPercentageInput.value,
        outputResolution: outputResolutionInput.value
    })
    ipcRenderer.once("run:res", (e, res)=>{
        alert(res)
    })
})





