module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
          alias: {
            "@": "./src",
            "@/src": "./src",
            "@/components": "./src/components",
            "@/app": "./src/app",
            "@/features": "./src/features",
            "@/theme": "./src/theme",
            "@/lib": "./src/lib",
            "@/config": "./src/config",
            "@/i18n": "./src/i18n",
            "@/db": "./src/db",
            "@/navigation": "./src/navigation",
            "@/store": "./src/store",
            "@/utils": "./src/utils",
            "@/widgets": "./src/widgets",
          },
        },
      ],
    ],
  };
};
