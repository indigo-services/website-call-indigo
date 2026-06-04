const RETURN_PATH_KEY = 'leadFormReturnTo';
const RETURN_SCROLL_KEY = 'leadFormScrollY';

export function storeFormOrigin() {
  sessionStorage.setItem(RETURN_PATH_KEY, window.location.pathname);
  sessionStorage.setItem(RETURN_SCROLL_KEY, String(window.scrollY));
}

export function restoreScrollOnReturn() {
  const scrollY = sessionStorage.getItem(RETURN_SCROLL_KEY);
  if (scrollY) {
    sessionStorage.removeItem(RETURN_SCROLL_KEY);
    requestAnimationFrame(() => window.scrollTo(0, Number(scrollY)));
  }
}
