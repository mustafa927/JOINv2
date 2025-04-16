document.addEventListener('DOMContentLoaded', function() {
    const isIndexPage = checkIfIndexPage();
    const mainContent = document.querySelector('.main-content');
    const splashScreen = document.querySelector('.splash-screen');
    
    if (isIndexPage) {
        handleIndexPageLoading(mainContent, splashScreen);
    } else {
        showContentImmediately(mainContent, splashScreen);
    }
});

function checkIfIndexPage() {
    return window.location.pathname.includes('index.html') || 
           window.location.pathname === '/' || 
           window.location.pathname.endsWith('/');
}

function isInternalNavigation() {
    const referrer = document.referrer;
    const currentDomain = window.location.origin;
    return referrer.startsWith(currentDomain) && referrer !== '';
}

function handleIndexPageLoading(mainContent, splashScreen) {
    if (isInternalNavigation()) {
        showContentImmediately(mainContent, splashScreen);
    } else {
        showSplashAnimation(mainContent, splashScreen);
    }
}

function showSplashAnimation(mainContent, splashScreen) {
    setTimeout(() => {
        if (splashScreen) splashScreen.style.opacity = '0';
        
        setTimeout(() => {
            if (splashScreen) splashScreen.style.display = 'none';
            if (mainContent) mainContent.classList.add('visible');
        }, 500);
    }, 1000);
}

function showContentImmediately(mainContent, splashScreen) {
    if (splashScreen) splashScreen.style.display = 'none';
    if (mainContent) mainContent.classList.add('visible');
}