export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    console.log("SW registered:", registration.scope);
  } catch (error) {
    console.error("SW registration failed:", error);
  }
}
