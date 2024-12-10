let currentSlide = 0;
const slides = document.querySelectorAll('.onboarding-slide');

function nextSlide() {
    if (currentSlide < slides.length - 1) {
        slides[currentSlide].style.display = 'none';
        currentSlide++;
        slides[currentSlide].style.display = 'flex';
    }
}
