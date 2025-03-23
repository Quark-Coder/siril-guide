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
            if (videoFrame && chosenVariant.videoUrl) {
                videoFrame.src = chosenVariant.videoUrl;
            }

            const downloadLink = document.getElementById("downloadLink");
            const infoLink = document.getElementById("infoLink");
            if (downloadLink && chosenVariant.links?.download) {
                downloadLink.href = chosenVariant.links.download;
            }
            if (infoLink && chosenVariant.links?.info) {
                infoLink.href = chosenVariant.links.info;
            }

            if (typeof initComparisons === "function") {
                initComparisons();
            }

            const variantsList = document.getElementById("variantsList");
            variantsList.innerHTML = "";
            variants.forEach((variant, index) => {
                const itemLink = document.createElement("a");
                itemLink.href = `gallery_datasets.html?id=${id}&variant=${index}`;
                itemLink.className = "variant-link";
                if (index === variantIndex) {
                    itemLink.classList.add("active");
                }

                const item = document.createElement("div");
                item.className = "variant-item";
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

            const variantItems = document.querySelectorAll('.variant-item');
            variantItems.forEach(item => {
                item.addEventListener('click', function() {
                    variantItems.forEach(i => i.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });

            const hdImageUrl = chosenVariant.comparison.hdImage;
            const hdButton = document.getElementById("hdButton");
            const hdModal = document.getElementById("hdModal");
            const hdImg = document.getElementById("hdImg");
            const hdClose = document.getElementById("hdClose");

            if (!hdImageUrl) {
                if (hdButton) {
                    hdButton.disabled = true;
                    hdButton.style.backgroundColor = "gray";
                    hdButton.style.cursor = "default";
                }
            } else if (hdButton && hdModal && hdImg && hdClose) {
                let scale = 1,
                    panning = false,
                    pointX = 0,
                    pointY = 0,
                    start = { x: 0, y: 0 },
                    offsetX,
                    offsetY;

                function setTransform() {
                    hdImg.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
                }

                // Открытие модального окна
                hdButton.addEventListener("click", function () {
                    hdModal.style.display = "block";
                    hdModal.style.opacity = 0;
                    document.body.style.overflow = "hidden";
                    hdImg.src = hdImageUrl;
                    hdImg.onload = function() {
                        requestAnimationFrame(() => {
                            const rect = hdImg.getBoundingClientRect();
                            offsetX = rect.left;
                            offsetY = rect.top;
                            pointX = 0;
                            pointY = 0;
                            scale = 1;
                            setTransform();
                            hdModal.style.opacity = 1;
                        });
                    };
                });

                function closeModal() {
                    hdModal.style.opacity = 0;
                    hdImg.style.transform = "translate(0px, 0px) scale(0.9)";
                    setTimeout(() => {
                        hdModal.style.display = "none";
                        document.body.style.overflow = "";
                    }, 300);
                }

                hdClose.addEventListener("click", closeModal);
                hdModal.addEventListener("click", function (e) {
                    if (e.target === hdModal) {
                        closeModal();
                    }
                });
                document.addEventListener("keydown", function (e) {
                    if (e.key === "Escape" && hdModal.style.display === "block") {
                        closeModal();
                    }
                });

                function onMouseMove(e) {
                    if (!panning) return;
                    pointX = e.clientX - start.x;
                    pointY = e.clientY - start.y;
                    setTransform();
                }

                function onMouseUp(e) {
                    panning = false;
                    hdImg.style.cursor = "grab";
                    hdImg.style.transition = "transform 0.2s ease-out";
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                }

                hdImg.addEventListener("mousedown", function (e) {
                    e.preventDefault();
                    start = { x: e.clientX - pointX, y: e.clientY - pointY };
                    panning = true;
                    hdImg.style.cursor = "grabbing";
                    hdImg.style.transition = "none";
                    document.addEventListener("mousemove", onMouseMove);
                    document.addEventListener("mouseup", onMouseUp);
                });

                hdImg.addEventListener("wheel", function (e) {
                    e.preventDefault();
                    const x = (e.clientX - offsetX - pointX) / scale;
                    const y = (e.clientY - offsetY - pointY) / scale;
                    const delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
                    const prevScale = scale;
                    delta > 0 ? (scale *= 1.1) : (scale /= 1.1);
                    scale = Math.min(Math.max(0.5, scale), 50);
                    if (scale !== prevScale) {
                        pointX = e.clientX - offsetX - x * scale;
                        pointY = e.clientY - offsetY - y * scale;
                        setTransform();
                    }
                }, { passive: false });
            }
        })
        .catch(error => console.error("Data upload error:", error));
});