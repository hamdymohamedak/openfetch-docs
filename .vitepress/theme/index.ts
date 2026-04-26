import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import ComparisonMatrix from "../components/ComparisonMatrix.vue";
import FeatureFlowCards from "../components/FeatureFlowCards.vue";
import Layout from "./Layout.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("ComparisonMatrix", ComparisonMatrix);
    app.component("FeatureFlowCards", FeatureFlowCards);
  },
} satisfies Theme;
