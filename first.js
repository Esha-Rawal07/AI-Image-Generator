const API_KEY = 'AIzaSyAV7FxcwWy7YYLwaXhz29rembnpNiGg2go';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${API_KEY}`;


function useExamplePrompt(promptText){
    const promptInput = document.getElementById('promptInput');
    promptInput.value = promptText;
    promptInput.focus();

    promptInput.classList.add("prompt-highlight");
    setTimeout(() =>{
        promptInput.classList.remove("prompt-highlight");
    },600);
};

function showError(message) {
    const errorContainer = document.getElementById("errorContainer");
    const errorMessage = document.getElementById("errorMessage");

    errorContainer.classList.remove("hidden");
     errorMessage.textContent = message;

 setTimeout(() =>{
    errorContainer.classList.add("hidden");
 }, 5000);
}

function clearError() {
    const errorContainer = document.getElementById("errorContainer");
    errorContainer.classList.add("hidden");
}

function getPaddingBottom(aspectRatio){
    const [width, height] = aspectRatio.split(':').map(Number);
    return `${(height / width) * 100}%`;
}
async function generateImages() {
     const prompt = document.getElementById("promptInput").value.trim();
     const aspectRatio = document.getElementById("aspectRatio").value;
     const imageCount = parseInt(document.getElementById("imageCount").value,10);
     const loader = document.getElementById("loader");
     const output = document.getElementById("output");

     clearError();

 if (!prompt){
   showError("Please enter a prompt.");
   return;
}
 loader.classList.remove("hidden");
 output.innerHTML = "";
 output.classList.add("hidden");

 const body = {
     "contents": [
        {
        parts: [
        {
           text: `${prompt}. Please generate image with aspect ratio ${aspectRatio}`,
        },
      ],
    },
 ],
    generationConfig: {
        responseModalities:["TEXT","IMAGE"], 
    },
 };

 try{
    for(let i = 0; i < imageCount; i++){
        const res = await fetch(ENDPOINT, {
            method: "POST",
            headers: {'Content-Type': "application/json"},
            body: JSON.stringify(body),
        });

        if(!res.ok){
            throw new Error(
                `Server responded with ${res.status}: ${res.statusText}`
            );
        }
        const data = await res.json();
        const base64Image = data?.candidates?.[0]?.content?.parts?.find(
            (p) => p.inlineData
        )?.inlineData?.data;

        if(!base64Image) {
            throw new Error("No Images returned from api");
        }

        const container = document.createElement("div");
        container.className = "image-container";
        container.style.paddingBottom = getPaddingBottom(aspectRatio);

        const img = document.createElement("img");
        img.src = `data:image/png;base64,${base64Image}`;
        img.alt = "AI generated image";
        img.loading = "lazy";
        img.className = "generated-image";

        const downloadLink = document.createElement("a");
        downloadLink.href = img.src;
        downloadLink.download = `Generated_image_${i + 1}.png`;
        downloadLink.className = "download-link";
        downloadLink.title =  "Download Image";
        downloadLink.innerHTML = `<i class="ri-download-line"></i>`;

        container.appendChild(img);
        container.appendChild(downloadLink);
        output.appendChild(container);
    }

    output.classList.remove("hidden");
 }catch (err) {
    console.error("Error Generating Image:", err);
    showError(`Error generating image server busy: ${err.message}`);
 }finally{
     loader.classList.add("hidden");
 }
}