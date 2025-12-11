import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
  },
  experimental: {
    forceSwcTransforms: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', {
              targets: {
                browsers: ['chrome 49', 'safari 10']
              },
              useBuiltIns: 'entry',
              corejs: 3
            }],
            '@babel/preset-react',
            '@babel/preset-typescript'
          ]
        }
      }
    });

    return config;
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
