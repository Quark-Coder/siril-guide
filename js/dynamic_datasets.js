document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const variantParam = params.get('variant');
    const variantIndex = variantParam ? parseInt(variantParam) : 0;

    if (!id) {
        console.error("The id parameter was not passed.");
        return;
    }

    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('Couldn\'t load data.json');
            return response.json();
        })
        .then(data => {
            if (!data[id]) {
                console.error("There is no data for the id:", id);
                return;
            }

            const dataset = data[id];
            const common = dataset.common || {};
            const variants = dataset.variants.map(variant => {
                return {
                    author: variant.author || "",
                    info: { ...common.info, ...variant.info },
                    comparison: { ...common.comparison, ...variant.comparison },
                    videoUrl: variant.videoUrl,
                    links: { ...common.links, ...variant.links },
                    software: variant.software
                };
            });

            if (!variants || variants.length === 0) {
                console.error("There are no options for this dataset");
                return;
            }

            const chosenVariant = variants[variantIndex] || variants[0];

            document.title = `${dataset.title} - ${chosenVariant.author} - Siril guide`;

            const baseImg = document.getElementById("baseImage");
            const overlayImg = document.getElementById("overlayImage");
            if (baseImg && overlayImg && chosenVariant.comparison) {
                baseImg.src = chosenVariant.comparison.baseImage;
                baseImg.alt = dataset.title;
                overlayImg.src = chosenVariant.comparison.overlayImage;
                overlayImg.alt = dataset.title;
            }

            const infoDescription = document.getElementById("infoDescription");
            if (infoDescription && chosenVariant.info) {
                infoDescription.innerHTML = `
                    <span style="font-size: 20px;">
                        <b>Data author:</b> ${chosenVariant.info.dataAuthor} <br>
                        <b>Focal length:</b> ${chosenVariant.info.focalLength} <br>
                        <b>Camera:</b> ${chosenVariant.info.camera} <br>
                        <b>Telescope:</b> ${chosenVariant.info.telescope} <br>
                        <b>Mount:</b> ${chosenVariant.info.mount} <br>
                        <b>Filter:</b> ${chosenVariant.info.filter} <br>
                        <b>Total integration time:</b> ${chosenVariant.info.totalIntegrationTime} <br>
                    </span>
                `;
            }

            const videoFrame = document.getElementById("videoFrame");
            if (videoFrame && chosenVariant.videoUrl) videoFrame.src = chosenVariant.videoUrl;

            const downloadLink = document.getElementById("downloadLink");
            const infoLink = document.getElementById("infoLink");
            if (downloadLink && chosenVariant.links?.download) downloadLink.href = chosenVariant.links.download;
            if (infoLink && chosenVariant.links?.info) infoLink.href = chosenVariant.links.info;

            if (typeof initComparisons === "function") initComparisons();

            const variantsList = document.getElementById("variantsList");
            variantsList.innerHTML = "";
            variants.forEach((variant, index) => {
                const itemLink = document.createElement("a");
                itemLink.href = `gallery_datasets.html?id=${id}&variant=${index}`;
                itemLink.className = "variant-link";
                if (index === variantIndex) itemLink.classList.add("active");

                const item = document.createElement("div");
                item.className = "variant-item";
                // Если индекс выбранного варианта совпадает с текущим, добавляем класс selected
                if (index === variantIndex) {
                    item.classList.add("selected");
                }

                const authorSpan = document.createElement("span");
                authorSpan.className = "variant-author";
                authorSpan.textContent = variant.author;
                item.appendChild(authorSpan);

                if (variant.software?.length) {
                    const iconsSpan = document.createElement("span");
                    iconsSpan.className = "variant-icons";
                    variant.software.forEach(iconUrl => {
                        const img = document.createElement("img");
                        img.src = iconUrl;
                        img.alt = "Icon";
                        iconsSpan.appendChild(img);
                    });
                    item.appendChild(iconsSpan);
                }

                itemLink.appendChild(item);
                variantsList.appendChild(itemLink);
            });

            // Добавляем обработчик клика для динамического применения класса "selected"
            const variantItems = document.querySelectorAll('.variant-item');
            variantItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    // Если не требуется немедленный переход по ссылке, можно отменить его:
                    // e.preventDefault();

                    // Удаляем класс selected у всех элементов
                    variantItems.forEach(i => i.classList.remove('selected'));
                    // Добавляем класс selected к нажатому элементу
                    this.classList.add('selected');
                });
            });
        })
        .catch(error => console.error("Data upload error:", error));
});
