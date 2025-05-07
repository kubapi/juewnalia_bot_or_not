const imageModules = import.meta.glob("./*.jpg", { eager: true });

export const images = Object.keys(imageModules).map((path) => {
  const file = path.split("/").pop();
  const label = file.startsWith("1_") ? "deepfake" : "real";
  return { url: imageModules[path].default, label };
});
