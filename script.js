/* 
  Author: Ola White

  Description: Hello there! This is my JavaScript file. I appreciate your visit to my code base. Follow me on my pages:

  Portfolio:   https://www.olawhite.com/
  Github:      https://github.com/whitesoftx
  Twitter:     https://twitter.com/olawhite
  
  Keep coding and exploring!
*/

function updateFileCount() {
  const input = document.getElementById("imageInput");
  const files = input.files;
  const fileCountText = document.getElementById("fileCountText");

  if (files.length > 0) {
    fileCountText.innerHTML = `<strong style="font-size: 18px; color: #d43535;">You have uploaded ${files.length} images.</strong>`;
  } else {
    fileCountText.innerText = "";
  }
}

// Attach the updateFileCount function to the change event of the file input
document
  .getElementById("imageInput")
  .addEventListener("change", updateFileCount);

function removeBackground() {
  const input = document.getElementById("imageInput");
  const files = input.files;
  const fileCountText = document.getElementById("fileCountText");

  if (files.length > 0) {
    // Display the number of files selected
    fileCountText.innerHTML = `<strong style="font-size: 18px; color: #d43535;">You have uploaded ${files.length} images.</strong>`;

    const zip = new JSZip();

    // Display "Background Removal in Progress" animation
    const loadingText = document.createElement("p");
    loadingText.innerText = "Background Removal in Progress";
    loadingText.classList.add("loading-text");
    document.body.appendChild(loadingText);

    const removeBackgroundAndDownload = (file) => {
      const formData = new FormData();
      formData.append("image_file", file);

      return fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": "replace_with_your_api_key",
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Background removal failed.");
          }
          return response.blob();
        })
        .then((blob) => {
          return { originalName: file.name, removedBackgroundBlob: blob };
        });
    };

    // Use Promise.all to wait for all background removals to finish
    Promise.all(
      Array.from(files).map((file) => removeBackgroundAndDownload(file))
    )
      .then((results) => {
        // Remove the loading text
        document.body.removeChild(loadingText);

        results.forEach((result) => {
          zip.file(result.originalName, result.removedBackgroundBlob);
        });

        // Generate a zip file and provide download link
        zip
          .generateAsync({ type: "blob" })
          .then((blob) => {
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = "background_removed_images.zip";
            downloadLink.click();
          })
          .finally(() => {
            // Refresh the page after download is complete
            location.reload();
          });
      })
      .catch((error) => {
        console.error("Error:", error);
        // Remove the loading text in case of an error
        document.body.removeChild(loadingText);
      });
  } else {
    alert("Please select at least one image file.");
  }
}
