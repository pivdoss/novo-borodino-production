import registryData from '../../data/plots.json';

export const PLOT_PRICE_PER_SOTKA = registryData.pricePerSotka;
export const PLOT_REGISTRY_UPDATED_AT = registryData.updatedAt;
export const PLOT_LAND_USE = registryData.landUse;

export const plotRegistry = Object.freeze(
  registryData.plots.map((plot) => Object.freeze({
    ...plot,
    priceRub: Math.round(plot.areaSotka * PLOT_PRICE_PER_SOTKA),
    landUse: PLOT_LAND_USE,
    updatedAt: PLOT_REGISTRY_UPDATED_AT,
  })),
);

export const plotRegistryById = new Map(plotRegistry.map((plot) => [plot.id, plot]));
export const availablePlots = Object.freeze(plotRegistry.filter((plot) => plot.status === 'available'));
export const soldPlots = Object.freeze(plotRegistry.filter((plot) => plot.status === 'sold'));
