document.addEventListener("DOMContentLoaded", function() {
    // Загружаем данные из data.json
    fetch('gallery_datasets/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Couldn't load data.json");
            }
            return response.json();
        })
        .then(data => {
            const galleryContainer = document.getElementById('galleryContainer');
            // Перебираем все наборы данных из JSON
            for (const id in data) {
                if (data.hasOwnProperty(id)) {
                    const dataset = data[id];
                    // Выбираем первый вариант как дефолтный (variant index = 0)
                    const variant = dataset.variants[0];
                    // Если есть overlayImage в варианте – используем её, иначе базовое изображение из common
                    const imageSrc = (variant.comparison && variant.comparison.overlayImage) ||
                        (dataset.common && dataset.common.comparison && dataset.common.comparison.baseImage) ||
                        "";

                    // Создаём ссылку для набора данных
                    const a = document.createElement('a');
                    a.href = "gallery_datasets/gallery_datasets.html?id=" + id + "&variant=0";
                    a.className = "gallery-item";

                    // Создаём блок с заголовком
                    const divText = document.createElement('div');
                    divText.className = "item-text";
                    const span = document.createElement('span');
                    span.textContent = dataset.title;
                    divText.appendChild(span);
                    a.appendChild(divText);

                    // Создаём элемент изображения
                    const img = document.createElement('img');
                    img.src = imageSrc;
                    img.alt = dataset.title;
                    a.appendChild(img);

                    // Добавляем элемент в контейнер галереи
                    galleryContainer.appendChild(a);
                }
            }
        })
        .catch(error => console.error("Error loading gallery data:", error));
});
