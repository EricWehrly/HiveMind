import { BiomeType } from "../../engine/js/mapping/biome";

new BiomeType({
    name: "Grasslands",
    color: "green",
    minSize: 1,
    maxSize: 6
});

new BiomeType({
    name: "Forest",
    color: "forest",
    minSize: 5,
    maxSize: 40
});

new BiomeType({
    name: "River",
    color: "blue",
    minSize: 5,
    maxSize: 40
});
