import { ComponentType } from "react";
import MemoryLeakBlock from "./MemoryLeakBlock";
import OverfitSqueezeBlock from "./OverfitSqueezeBlock";
import InteractiveCognitiveAnchor from "./interactive-cognitive-anchor";
import ConceptHighlight from "./concept-highlight";

const registry: Record<string, ComponentType<{ content: string; [key: string]: unknown }>> = {
  "memory-leak": MemoryLeakBlock,
  "overfit-squeeze": OverfitSqueezeBlock,
  "cognitive-anchor": InteractiveCognitiveAnchor,
  "concept-highlight": ConceptHighlight,
};

export function getBlockComponent(name: string): ComponentType<{ content: string; [key: string]: unknown }> | undefined {
  return registry[name];
}

export function registerBlock(name: string, component: ComponentType<{ content: string; [key: string]: unknown }>) {
  registry[name] = component;
}
