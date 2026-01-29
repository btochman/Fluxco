"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DesignCalculationLoaderProps {
  onComplete: () => void;
  ratedPower: number;
  primaryVoltage: number;
  secondaryVoltage: number;
}

// Real electromagnetic and transformer design equations
const equations = [
  // Fundamental Laws
  { category: "Faraday's Law", equation: "E = -N × dΦ/dt", description: "Induced EMF calculation" },
  { category: "Magnetic Flux", equation: "Φ = B × A", description: "Core flux density" },
  { category: "Ampere's Law", equation: "∮H·dl = N×I", description: "Magnetomotive force" },

  // Transformer Basics
  { category: "Turns Ratio", equation: "a = N₁/N₂ = V₁/V₂", description: "Primary to secondary ratio" },
  { category: "EMF Equation", equation: "E = 4.44 × f × N × Φₘ", description: "RMS voltage calculation" },
  { category: "Flux Density", equation: "Bₘ = E/(4.44×f×N×Aᶜ)", description: "Peak magnetic induction" },

  // Core Design
  { category: "Core Area", equation: "Aᶜ = √(kVA)/(K×Bₘ×f)", description: "Cross-sectional area" },
  { category: "Window Area", equation: "Aᵥ = (N₁I₁ + N₂I₂)/(J×Kᵥ)", description: "Winding window sizing" },
  { category: "Core Weight", equation: "Wᶜ = ρ × Vᶜ × Sᶠ", description: "Lamination stack mass" },

  // Loss Calculations
  { category: "Steinmetz Eq.", equation: "Pᶜₒᵣₑ = Kₕ×f×Bⁿ + Kₑ×f²×B²", description: "Core loss (hysteresis + eddy)" },
  { category: "Copper Loss", equation: "Pᶜᵤ = I₁²R₁ + I₂²R₂", description: "Winding resistive losses" },
  { category: "Stray Loss", equation: "Pₛₜᵣₐᵧ = Kₛ × (I × H)²", description: "Structural eddy currents" },
  { category: "Total Loss", equation: "Pₜₒₜₐₗ = Pₙₗ + Pₗₗ", description: "No-load + load losses" },

  // Impedance
  { category: "Leakage Reactance", equation: "Xₗ = 2πf×μ₀×N²×(Lₘₜ/3h)", description: "Winding inductance" },
  { category: "Impedance", equation: "Z% = (Vₛᶜ/Vᵣₐₜₑ)×100", description: "Short-circuit impedance" },
  { category: "Resistance", equation: "R = ρ×L/A", description: "Winding DC resistance" },

  // Thermal
  { category: "Heat Transfer", equation: "Q = h×A×ΔT", description: "Convection cooling" },
  { category: "Hot Spot", equation: "θₕₛ = θₒᵢₗ + Δθₕₛ", description: "Winding temperature rise" },
  { category: "Thermal Time", equation: "τ = m×Cₚ/(h×A)", description: "Thermal constant" },

  // Efficiency
  { category: "Efficiency", equation: "η = Pₒᵤₜ/(Pₒᵤₜ + Pₗₒₛₛ)", description: "Power conversion ratio" },
  { category: "Regulation", equation: "%VR = (Vₙₗ - Vₗ)/Vₗ×100", description: "Voltage regulation" },
  { category: "Max Efficiency", equation: "Pₙₗ = Pₗₗ at η_max", description: "Optimal loading point" },

  // Cost Estimation
  { category: "Material Cost", equation: "Cₘ = Σ(Wᵢ × $ᵢ)", description: "Raw material pricing" },
  { category: "Lifecycle Cost", equation: "LCC = C₀ + Σ(Pₗₒₛₛ×$/kWh×t)", description: "Total ownership cost" },
  { category: "Payback", equation: "t = ΔC₀/(ΔPₗₒₛₛ×$/kWh×8760)", description: "Efficiency investment return" },

  // Mechanical
  { category: "Short Circuit", equation: "Fₛᶜ = (2πf×Iₛᶜ)²×L/h", description: "Winding forces" },
  { category: "Tank Stress", equation: "σ = P×r/t", description: "Pressure vessel analysis" },
  { category: "Oil Volume", equation: "Vₒᵢₗ = Vₜₐₙₖ - Vₐᶜₜᵢᵥₑ", description: "Insulating fluid capacity" },
];

const calculationPhases = [
  { name: "Initializing Design Engine", duration: 500 },
  { name: "Computing Core Geometry", duration: 800 },
  { name: "Calculating Magnetic Circuit", duration: 900 },
  { name: "Optimizing Winding Design", duration: 1000 },
  { name: "Analyzing Losses & Efficiency", duration: 1200 },
  { name: "Thermal Modeling", duration: 800 },
  { name: "Impedance Calculations", duration: 700 },
  { name: "Cost Analysis", duration: 600 },
  { name: "Generating Technical Drawings", duration: 500 },
];

export function DesignCalculationLoader({
  onComplete,
  ratedPower,
  primaryVoltage,
  secondaryVoltage
}: DesignCalculationLoaderProps) {
  const [visibleEquations, setVisibleEquations] = useState<number[]>([]);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  // Shuffle equations for random appearance
  const shuffledEquations = useMemo(() => {
    return [...equations].sort(() => Math.random() - 0.5);
  }, []);

  // Calculate some "live" values based on inputs
  const turnsRatio = (primaryVoltage / secondaryVoltage).toFixed(2);
  const estimatedCurrent = ((ratedPower * 1000) / (Math.sqrt(3) * secondaryVoltage)).toFixed(1);

  useEffect(() => {
    const totalDuration = 7000;
    const equationInterval = totalDuration / equations.length;

    // Add equations one by one
    const equationTimers = shuffledEquations.map((_, index) => {
      return setTimeout(() => {
        setVisibleEquations(prev => [...prev, index]);
      }, index * equationInterval * 0.8);
    });

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1.5, 100));
    }, totalDuration / 70);

    // Phase progression
    let phaseTime = 0;
    const phaseTimers = calculationPhases.map((phase, index) => {
      const timer = setTimeout(() => {
        setCurrentPhase(index);
      }, phaseTime);
      phaseTime += phase.duration;
      return timer;
    });

    // Complete after 7 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, totalDuration);

    return () => {
      equationTimers.forEach(clearTimeout);
      phaseTimers.forEach(clearTimeout);
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [onComplete, shuffledEquations]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-4xl mx-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Designing Your {ratedPower} kVA Transformer
          </h2>
          <p className="text-muted-foreground">
            {primaryVoltage.toLocaleString()}V / {secondaryVoltage}V • Turns Ratio: {turnsRatio}:1 • Est. Secondary Current: {estimatedCurrent}A
          </p>
        </motion.div>

        {/* Current Phase */}
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-full px-6 py-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary font-medium">
              {calculationPhases[currentPhase]?.name || "Finalizing..."}
            </span>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Calculating...</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Equations Grid */}
        <div className="bg-card/50 border border-border rounded-lg p-6 max-h-[400px] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent pointer-events-none z-10" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {visibleEquations.map((eqIndex) => {
                const eq = shuffledEquations[eqIndex];
                return (
                  <motion.div
                    key={eqIndex}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                    className="bg-background/80 border border-border/50 rounded-md p-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="text-[10px] text-primary/70 uppercase tracking-wider mb-1">
                      {eq.category}
                    </div>
                    <div className="font-mono text-sm text-foreground font-medium mb-1">
                      {eq.equation}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {eq.description}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Running electromagnetic field analysis and thermal simulations...
        </motion.p>
      </div>
    </div>
  );
}

export default DesignCalculationLoader;
