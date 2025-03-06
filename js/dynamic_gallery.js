document.addEventListener("DOMContentLoaded", function() {
    fetch('gallery_datasets/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Couldn't load data.json");
            }
            return response.json();
        })
        .then(data => {
            const galleryContainer = document.getElementById('galleryContainer');
            for (const id in data) {
                if (data.hasOwnProperty(id)) {
                    const dataset = data[id];
                    const variant = dataset.variants[0];
                    const imageSrc = (variant.comparison && variant.comparison.overlayImage) ||
                        (dataset.common && dataset.common.comparison && dataset.common.comparison.baseImage) ||
                        "";

                    const a = document.createElement('a');
                    a.href = "gallery_datasets/gallery_datasets.html?id=" + id + "&variant=0";
                    a.className = "gallery-item";

                    const divText = document.createElement('div');
                    divText.className = "item-text";
                    const span = document.createElement('span');
                    span.textContent = dataset.title;
                    divText.appendChild(span);
                    a.appendChild(divText);

                    const img = document.createElement('img');
                    img.src = imageSrc;
                    img.alt = dataset.title;
                    a.appendChild(img);

                    galleryContainer.appendChild(a);
                }
            }
        })
        .catch(error => console.error("Error loading gallery data:", error));
});
