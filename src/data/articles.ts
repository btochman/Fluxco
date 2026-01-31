export interface Article {
  slug: string;
  title: string;
  description: string;
  category: "guides" | "technical" | "industry";
  publishedAt: string;
  updatedAt?: string;
  readTime: string;
  content: string;
  keywords: string[];
}

export const articles: Article[] = [
  {
    slug: "how-to-choose-distribution-transformer",
    title: "How to Choose the Right Distribution Transformer",
    description:
      "A complete buyer's guide to selecting distribution transformers. Learn about kVA sizing, voltage classes, cooling types, and key specifications to match your application.",
    category: "guides",
    publishedAt: "2026-01-30",
    readTime: "8 min read",
    keywords: [
      "distribution transformer",
      "transformer sizing",
      "how to choose transformer",
      "transformer buying guide",
      "kVA sizing",
    ],
    content: `
## Understanding Distribution Transformers

Distribution transformers are the workhorses of electrical infrastructure, stepping down medium voltage power to usable levels for homes, businesses, and industrial facilities. Choosing the right one requires understanding your load requirements, installation environment, and long-term operational needs.

## Step 1: Determine Your Load Requirements

### Calculate Total Connected Load

Start by adding up all the electrical loads that will be served by the transformer:

- **Motors**: Use nameplate horsepower or kW ratings
- **Lighting**: Total wattage including ballast losses
- **HVAC**: Compressor and fan motor loads
- **General receptacles**: Estimate based on building use

### Apply Demand Factors

Not all loads run simultaneously. Apply appropriate demand factors based on your application:

| Load Type | Typical Demand Factor |
|-----------|----------------------|
| Commercial lighting | 70-90% |
| Industrial motors | 60-80% |
| Residential | 40-60% |
| Data centers | 80-95% |

### Add Growth Margin

Plan for 20-25% future growth unless you have specific expansion plans that require more.

## Step 2: Select Voltage Class

### Primary Voltage

Match your utility's distribution voltage. Common classes include:

- **4.16 kV** - Older systems, some industrial
- **12.47 kV / 13.2 kV / 13.8 kV** - Most common utility distribution
- **23 kV / 34.5 kV** - Rural or long-distance distribution

### Secondary Voltage

Based on your utilization equipment:

- **120/240V** - Single-phase residential/light commercial
- **208Y/120V** - Three-phase commercial (common in older buildings)
- **480Y/277V** - Three-phase commercial/industrial (most efficient)
- **480V delta** - Industrial motor loads

## Step 3: Choose Single-Phase or Three-Phase

**Single-phase transformers** are appropriate when:
- Total load is under 200 kVA
- Loads are primarily single-phase (residential, small commercial)
- Three-phase power isn't available

**Three-phase transformers** are better when:
- Serving three-phase motor loads
- Total load exceeds 200 kVA
- Efficiency is a priority (three-phase is more efficient)

## Step 4: Select Cooling Class

### ONAN (Oil Natural Air Natural)
- Self-cooled, no fans or pumps
- Most common for distribution transformers
- Suitable for most applications up to 10 MVA

### ONAF (Oil Natural Air Forced)
- Fans assist cooling during peak loads
- Allows higher capacity from same unit
- Common for larger distribution transformers

### Dry-Type (AN/AF)
- No oil, air-cooled
- Required for indoor installations in many jurisdictions
- Higher cost but eliminates oil containment requirements

## Step 5: Specify Efficiency Level

All distribution transformers sold in the US must meet DOE 2016 efficiency standards. However, you can specify higher efficiency for:

- Lower lifetime operating costs
- Reduced heat generation
- Environmental goals

Calculate lifecycle cost: A more efficient transformer costs more upfront but saves on losses over 20-30 year life.

## Step 6: Consider Installation Requirements

### Pad-Mount vs. Pole-Mount

**Pad-mount** transformers:
- Ground-level installation on concrete pad
- Required for underground distribution
- Tamper-resistant enclosure
- Larger footprint but easier maintenance

**Pole-mount** transformers:
- Mounted on utility poles
- Smaller sizes (typically under 500 kVA)
- Lower installation cost
- Used with overhead distribution

### Indoor vs. Outdoor

Indoor installations typically require:
- Dry-type transformers (in most jurisdictions)
- Adequate ventilation
- Fire-rated rooms for oil-filled units
- Spill containment if oil-filled

## Step 7: Specify Protection and Accessories

### Standard Protection
- **Primary fusing**: Bay-o-net or external fuse cutouts
- **Secondary breaker**: For self-protected (CSP) units
- **Surge arresters**: Lightning and switching surge protection

### Optional Accessories
- **Tap changers**: NLTC (no-load) or OLTC (on-load)
- **Temperature gauges**: Monitor winding and oil temperature
- **Pressure relief**: Prevent tank rupture
- **Oil sampling valves**: For testing and maintenance

## Common Sizing Mistakes to Avoid

1. **Undersizing**: Not accounting for motor starting inrush or future growth
2. **Oversizing**: Paying for capacity you'll never use, plus reduced efficiency at light loads
3. **Ignoring harmonics**: Non-linear loads may require K-rated or oversized transformers
4. **Wrong voltage**: Verify utility voltage before ordering

## Ready to Order?

FluxCo can help you select the right distribution transformer for your application. Our engineering team reviews every order to ensure proper sizing and specifications.

[Contact us for a quote](/contact) or [browse our inventory](/inventory) to see what's available for immediate delivery.
`,
  },
  {
    slug: "padmount-vs-substation-transformer",
    title: "Padmount vs. Substation Transformers: Which Do You Need?",
    description:
      "Compare padmount and substation transformers: capacity ranges, applications, installation requirements, and cost considerations to determine the right choice for your project.",
    category: "guides",
    publishedAt: "2026-01-30",
    readTime: "6 min read",
    keywords: [
      "padmount transformer",
      "substation transformer",
      "transformer comparison",
      "power transformer",
      "distribution transformer",
    ],
    content: `
## Overview

Choosing between a padmount transformer and a substation transformer depends on your capacity requirements, installation site, and budget. This guide breaks down the key differences to help you make the right decision.

## Quick Comparison

| Feature | Padmount | Substation |
|---------|----------|------------|
| Capacity | 75 kVA - 10 MVA | 5 MVA - 500+ MVA |
| Primary Voltage | 4 kV - 35 kV | 34.5 kV - 500 kV |
| Installation | Concrete pad | Dedicated substation yard |
| Enclosure | Self-contained cabinet | Open-air or building |
| Typical Cost | $15K - $150K | $200K - $5M+ |
| Lead Time | 4-24 weeks | 26-60 weeks |

## Padmount Transformers

### What They Are

Padmount transformers are self-contained, ground-mounted units designed for underground distribution systems. They're enclosed in a locked, tamper-resistant steel cabinet that houses the transformer, switches, and protective equipment.

### Best Applications

- **Commercial developments**: Shopping centers, office parks, retail
- **Residential subdivisions**: Underground residential distribution (URD)
- **Institutional**: Schools, hospitals, government buildings
- **Light industrial**: Warehouses, small manufacturing

### Advantages

1. **Aesthetics**: Low profile, can be landscaped around
2. **Safety**: Dead-front construction, locked cabinet
3. **Flexibility**: Loop-feed or radial configurations
4. **Cost**: Lower installation cost than substation
5. **Space**: Smaller footprint than equivalent substation

### Limitations

- Maximum capacity around 10 MVA
- Limited to medium voltage primary (typically 35 kV max)
- Not suitable for transmission-level voltages
- Harder to expand capacity later

## Substation Transformers

### What They Are

Substation transformers (also called power transformers) are large, high-capacity units used in utility substations and large industrial facilities. They handle the bulk power transformation between transmission and distribution voltages.

### Best Applications

- **Utility substations**: Grid infrastructure
- **Large industrial**: Steel mills, mining, heavy manufacturing
- **Power generation**: Step-up from generators
- **Data centers**: Hyperscale facilities requiring 20+ MW
- **Renewable energy**: Solar/wind farm collector substations

### Advantages

1. **Capacity**: Handle massive loads (500+ MVA)
2. **Voltage**: Can step between transmission voltages
3. **Efficiency**: Higher efficiency at scale
4. **Features**: OLTC, advanced cooling, monitoring systems
5. **Redundancy**: N+1 configurations possible

### Limitations

- High cost ($500K to several million)
- Long lead times (40-60 weeks for custom)
- Requires dedicated substation with switchgear
- More complex installation and commissioning
- Ongoing maintenance requirements

## Decision Framework

### Choose Padmount When:

- Load is under 10 MVA
- Primary voltage is 35 kV or less
- Underground distribution is required or preferred
- Space is limited
- Budget is constrained
- Faster delivery is needed

### Choose Substation When:

- Load exceeds 10 MVA
- Primary voltage exceeds 35 kV
- Multiple feeders are needed
- Future expansion is planned
- Redundancy is required
- Industrial process loads require high reliability

## Cost Considerations

### Padmount Total Cost

- **Equipment**: $25,000 - $150,000
- **Concrete pad**: $3,000 - $8,000
- **Installation**: $5,000 - $15,000
- **Primary cable**: Varies by distance
- **Total typical**: $40,000 - $200,000

### Substation Total Cost

- **Transformer**: $300,000 - $3,000,000+
- **Switchgear**: $100,000 - $500,000
- **Civil/structural**: $200,000 - $1,000,000
- **Installation/commissioning**: $100,000 - $500,000
- **Total typical**: $1,000,000 - $10,000,000+

## Hybrid Approaches

For medium-scale applications (5-20 MVA), consider:

1. **Multiple padmounts**: Several smaller units instead of one substation
2. **Unit substation**: Compact, factory-assembled substation package
3. **Mobile substation**: Temporary or emergency applications

## FluxCo Can Help

Not sure which approach is right for your project? Our engineering team can review your requirements and recommend the most cost-effective solution.

- [Request a consultation](#contact)
- [Browse padmount inventory](/transformers/padmount)
- [Browse substation inventory](/transformers/substation)
`,
  },
  {
    slug: "transformer-lead-times-2026",
    title: "Transformer Lead Times in 2026: What to Expect",
    description:
      "Current transformer lead times and supply chain status for 2026. Planning guidance for procurement managers and project teams on padmount, distribution, and power transformers.",
    category: "industry",
    publishedAt: "2026-01-30",
    readTime: "5 min read",
    keywords: [
      "transformer lead time",
      "transformer supply chain",
      "transformer shortage",
      "transformer delivery",
      "transformer procurement",
    ],
    content: `
## Current Market Conditions

The transformer market has stabilized somewhat from the extreme shortages of 2022-2024, but lead times remain extended compared to pre-pandemic norms. Here's what procurement managers and project planners need to know for 2026.

## Current Lead Times by Type

### Distribution Transformers (Padmount, Pole-Mount)

| Size Range | Current Lead Time | Pre-2020 Norm |
|------------|------------------|---------------|
| Under 500 kVA | 12-20 weeks | 4-8 weeks |
| 500 kVA - 2.5 MVA | 16-28 weeks | 8-12 weeks |
| 2.5 MVA - 10 MVA | 24-36 weeks | 12-16 weeks |

**Stock availability**: Some standard sizes available from inventory with 1-4 week delivery.

### Power/Substation Transformers

| Size Range | Current Lead Time | Pre-2020 Norm |
|------------|------------------|---------------|
| 5-20 MVA | 36-52 weeks | 20-30 weeks |
| 20-100 MVA | 48-72 weeks | 30-40 weeks |
| 100+ MVA | 60-90 weeks | 40-52 weeks |

**Note**: Custom designs, unusual voltages, or special testing requirements add 4-12 weeks.

### Dry-Type Transformers

| Size Range | Current Lead Time | Pre-2020 Norm |
|------------|------------------|---------------|
| Under 1 MVA | 8-16 weeks | 4-8 weeks |
| 1-5 MVA | 12-24 weeks | 8-12 weeks |
| 5+ MVA | 20-32 weeks | 12-20 weeks |

## Factors Affecting Lead Times

### Demand Drivers

1. **Grid modernization**: Utilities replacing aging infrastructure
2. **Data center growth**: Hyperscale facilities consuming massive capacity
3. **Renewable energy**: Solar and wind farms requiring collection transformers
4. **EV infrastructure**: Charging networks driving distribution demand
5. **Reshoring manufacturing**: Industrial facilities returning to US

### Supply Constraints

1. **Raw materials**: Grain-oriented electrical steel (GOES) remains tight
2. **Skilled labor**: Experienced transformer manufacturing workforce limited
3. **Manufacturing capacity**: New facilities take years to build
4. **Component shortages**: Bushings, tap changers, and other components

## Procurement Strategies

### Plan Ahead

- **Add 25% buffer** to quoted lead times for project planning
- **Order early**: Place orders as soon as specifications are finalized
- **Consider alternatives**: Be flexible on manufacturer if lead time is critical

### Work With Your Supplier

- **Share forecasts**: Give suppliers visibility into future needs
- **Commit early**: Firm orders get priority over quotes
- **Be specification-flexible**: Standard designs ship faster than custom

### Stock Strategies

- **Emergency spares**: Keep critical sizes in inventory
- **Multi-site pooling**: Share spare transformers across facilities
- **Refurbished units**: Consider reconditioned transformers for backup

## What FluxCo Offers

We help customers navigate the current market through:

1. **Real-time inventory**: See what's actually available now
2. **Multi-source procurement**: Access to global manufacturer network
3. **Lead time visibility**: Honest, updated delivery estimates
4. **Stock programs**: Reserve capacity for ongoing needs

## Looking Ahead

Industry analysts expect lead times to gradually improve through 2026-2027 as:

- New manufacturing capacity comes online
- Raw material supply stabilizes
- Demand growth moderates from current peaks

However, we don't expect a return to pre-pandemic "just in time" availability. Building longer lead times into project planning is the new normal.

## Get Current Availability

Contact FluxCo for up-to-date lead times on your specific transformer requirements.

- [Check inventory](/inventory)
- [Request quote](#contact)
`,
  },
  {
    slug: "doe-transformer-efficiency-standards",
    title: "DOE Transformer Efficiency Standards: What You Need to Know",
    description:
      "Complete guide to DOE 2016 transformer efficiency standards (10 CFR 431). Compliance requirements, efficiency levels, and how to specify compliant transformers.",
    category: "technical",
    publishedAt: "2026-01-30",
    readTime: "7 min read",
    keywords: [
      "DOE transformer",
      "transformer efficiency",
      "10 CFR 431",
      "DOE 2016",
      "transformer standards",
      "energy efficient transformer",
    ],
    content: `
## Overview

The U.S. Department of Energy (DOE) sets minimum efficiency standards for distribution transformers under 10 CFR Part 431. Understanding these requirements is essential for anyone specifying or purchasing transformers for use in the United States.

## What's Covered

### Transformers Subject to DOE Standards

- **Liquid-immersed distribution transformers**: 10 kVA to 2,500 kVA
- **Dry-type distribution transformers**: 15 kVA to 2,500 kVA
- Medium voltage (primary ≤ 34.5 kV for liquid, ≤ 35 kV for dry)
- 60 Hz operation

### Exemptions

The following are NOT subject to DOE standards:

- Transformers under 10 kVA (liquid) or 15 kVA (dry)
- Transformers over 2,500 kVA
- Autotransformers
- Rectifier transformers
- Transformers with special impedance requirements
- Mining transformers
- Drive isolation transformers
- Welding transformers
- Non-60 Hz transformers

## DOE 2016 Efficiency Standards

The current standards took effect January 1, 2016 (often called "DOE 2016"). They set minimum efficiency at 50% of nameplate load.

### Liquid-Immersed Efficiency Minimums (Sample)

| kVA | Single-Phase | Three-Phase |
|-----|-------------|-------------|
| 50 | 98.91% | 98.83% |
| 100 | 99.08% | 99.02% |
| 250 | 99.23% | 99.17% |
| 500 | 99.32% | 99.27% |
| 1000 | 99.39% | 99.35% |
| 2500 | 99.47% | 99.44% |

### Dry-Type Efficiency Minimums (Sample, Medium Voltage)

| kVA | Single-Phase | Three-Phase |
|-----|-------------|-------------|
| 50 | 98.60% | 98.48% |
| 100 | 98.80% | 98.72% |
| 250 | 99.02% | 98.95% |
| 500 | 99.14% | 99.09% |
| 1000 | 99.23% | 99.19% |
| 2500 | 99.33% | 99.30% |

*Full tables available in 10 CFR 431.196*

## How Efficiency Is Measured

### Test Standard

Efficiency is measured per DOE test procedure (10 CFR 431.193), which references:

- IEEE C57.12.90 for liquid-immersed
- IEEE C57.12.91 for dry-type

### Key Points

- Efficiency measured at **50% of nameplate load**
- Reference temperature of **75°C** for losses
- Includes both **no-load (core) losses** and **load (winding) losses**
- Round to nearest 0.01%

## Compliance Requirements

### For Manufacturers

- All covered transformers must meet minimum efficiency
- Units must be tested and certified
- Efficiency must be displayed on nameplate
- Records must be maintained

### For Buyers

- You can only purchase compliant transformers for installation in the US
- Verify efficiency rating meets or exceeds DOE minimum
- Request efficiency test reports for critical applications

## Specifying Efficient Transformers

### DOE Minimum vs. Higher Efficiency

DOE sets the **floor**, not the ceiling. You can specify higher efficiency for:

- Lower lifecycle operating costs
- Reduced heat generation
- LEED or sustainability goals
- Utility rebate programs

### Total Owning Cost (TOC)

Many buyers evaluate transformers using Total Owning Cost:

**TOC = Purchase Price + (A × No-Load Loss) + (B × Load Loss)**

Where:
- **A** = capitalized cost of no-load losses ($/watt)
- **B** = capitalized cost of load losses ($/watt)

Typical A and B factors range from $3-8/watt depending on electricity cost and load profile.

### Specifying in RFQs

Include these in your transformer specifications:

1. "Transformer shall meet DOE 10 CFR 431 efficiency requirements"
2. Specify efficiency at 50% load if you want above-minimum
3. Request efficiency test data with quotation
4. Include no-load and load loss guarantees

## Common Questions

### Q: Do DOE standards apply to used/refurbished transformers?

**A**: DOE standards apply at time of manufacture. A transformer built before 2016 can still be sold and installed even if it doesn't meet current standards. However, it's often more economical to buy new, efficient units.

### Q: What about transformers from outside the US?

**A**: Any distribution transformer installed in the US must meet DOE standards, regardless of where it was manufactured.

### Q: Are there penalties for non-compliance?

**A**: DOE can assess civil penalties up to $542 per violation per day. Manufacturers face the primary enforcement risk, but buyers should verify compliance to avoid project delays.

## FluxCo Compliance

All new transformers supplied by FluxCo meet or exceed DOE 2016 efficiency standards. We provide:

- Efficiency data on all quotations
- Test reports upon request
- Higher-efficiency options when available

[Request a quote](#contact) or [browse our DOE-compliant inventory](/inventory).
`,
  },
  {
    slug: "transformer-cooling-classes-explained",
    title: "Transformer Cooling Classes Explained: ONAN, ONAF, OFAF, and More",
    description:
      "Understanding transformer cooling class designations. Learn what ONAN, ONAF, OFAF, and other cooling codes mean and how to select the right cooling for your application.",
    category: "technical",
    publishedAt: "2026-01-30",
    readTime: "6 min read",
    keywords: [
      "transformer cooling",
      "ONAN",
      "ONAF",
      "OFAF",
      "cooling class",
      "transformer rating",
    ],
    content: `
## What Are Cooling Classes?

Transformer cooling class designations describe how heat is removed from the transformer during operation. The cooling method directly affects the transformer's capacity rating and determines where it can be installed.

## Reading Cooling Class Codes

Cooling class codes use four letters (or two pairs of two letters):

**Position 1-2: Internal cooling medium and circulation**
**Position 3-4: External cooling medium and circulation**

### Letter Meanings

| Letter | Position 1 | Position 2 | Positions 3-4 |
|--------|-----------|-----------|---------------|
| O | Oil (mineral) | - | - |
| K | Insulating liquid (other) | - | - |
| N | - | Natural circulation | Natural circulation |
| F | - | Forced circulation | Forced circulation |
| D | - | Directed flow | - |
| A | - | - | Air |
| W | - | - | Water |

## Common Cooling Classes

### ONAN (Oil Natural Air Natural)

The most common cooling class for distribution transformers.

- **How it works**: Oil circulates naturally by convection; air flows naturally over radiators
- **Typical application**: Distribution transformers up to ~10 MVA
- **Advantages**: Simple, reliable, no auxiliary power needed
- **Limitations**: Limited capacity; requires adequate ambient airflow

### ONAF (Oil Natural Air Forced)

Adds fans to increase capacity.

- **How it works**: Oil circulates naturally; fans force air over radiators
- **Typical application**: Distribution and small power transformers, 2.5-30 MVA
- **Advantages**: Higher capacity from same tank; fans only run when needed
- **Limitations**: Requires auxiliary power; fan maintenance

**Dual Rating**: ONAN/ONAF transformers have two ratings:
- ONAN rating (fans off): ~70-80% of ONAF rating
- ONAF rating (fans on): Full rating

### OFAF (Oil Forced Air Forced)

Both oil and air are pumped for maximum cooling.

- **How it works**: Pumps circulate oil; fans force air over radiators
- **Typical application**: Large power transformers, 30+ MVA
- **Advantages**: Maximum heat removal; highest power density
- **Limitations**: Depends on pumps and fans; higher maintenance

### ODAF (Oil Directed Air Forced)

Oil is directed through windings for targeted cooling.

- **How it works**: Oil pumped through specific paths in windings; fans cool radiators
- **Typical application**: Large power transformers, especially generator step-ups
- **Advantages**: Most effective winding cooling; highest capacity
- **Limitations**: Complex design; pump/fan dependent

### OFWF (Oil Forced Water Forced)

Water cooling for special applications.

- **How it works**: Oil pumped through oil-to-water heat exchangers
- **Typical application**: Underground substations, industrial plants with cooling water
- **Advantages**: Compact; no air heat rejection needed
- **Limitations**: Requires cooling water supply; heat exchanger maintenance

## Dry-Type Cooling Classes

### AN (Air Natural)

- Self-cooled by natural convection
- Most common for dry-type transformers
- Typical up to ~5 MVA

### AF (Air Forced)

- Fans assist cooling
- Higher ratings than AN
- Common for larger dry-type units

### ANS/AFS

Some dry-type transformers have sealed enclosures with internal fans for dirty or hazardous environments.

## Selecting the Right Cooling Class

### For Distribution Transformers (< 10 MVA)

**ONAN** is the default choice unless:
- Space is very limited → Consider ONAF for more capacity per footprint
- Indoor installation → Consider dry-type AN or AF
- High ambient temperature → Consider ONAF for derating margin

### For Power Transformers (10-100 MVA)

**ONAN/ONAF** dual-rated is typical for:
- Normal utility and industrial applications
- Moderate load cycling
- Adequate installation space

**OFAF** is preferred when:
- Maximum capacity from given footprint
- Continuous high loading
- Hot ambient conditions

### For Large Power Transformers (100+ MVA)

**ODAF** or **OFAF** are standard due to:
- High heat density in large windings
- Need for reliable forced cooling
- Often redundant cooling systems specified

## Temperature Rise and Cooling

Transformer ratings assume specific temperature rise limits:

| Cooling Class | Typical Winding Rise | Typical Top Oil Rise |
|---------------|---------------------|---------------------|
| ONAN | 65°C | 55°C |
| ONAF | 65°C | 55°C |
| OFAF | 65°C | 55°C |

**55°C rise** transformers (older standard) can carry more load in cooler weather but have lower nominal ratings.

**65°C rise** is current standard and provides good balance of capacity and life.

## Altitude and Ambient Derating

Standard ratings assume:
- 1,000 meters altitude
- 30°C average ambient, 40°C maximum

Higher altitude or temperature requires derating or specifying enhanced cooling.

## Questions?

FluxCo's engineering team can help you select the right cooling class for your application.

[Contact us](#contact) or [browse inventory](/inventory) with cooling class filters.
`,
  },
  {
    slug: "why-buying-transformers-is-so-difficult",
    title: "Why Buying a Transformer Is So Difficult (And What to Do About It)",
    description:
      "The transformer procurement process is broken: fragmented suppliers, no visible inventory, weeks for quotes, and months for delivery. Here's why it's so hard and how to navigate it.",
    category: "industry",
    publishedAt: "2026-01-31",
    readTime: "7 min read",
    keywords: [
      "buy transformer",
      "transformer procurement",
      "transformer supplier",
      "transformer quote",
      "transformer lead time",
      "find transformer",
      "transformer marketplace",
    ],
    content: `
## The Frustrating Reality of Transformer Procurement

If you've ever tried to buy a transformer, you know the drill. You need a 1,000 kVA padmount unit. Sounds simple enough. But then reality hits:

- You don't know who makes what you need
- The manufacturers who might have it don't list inventory online
- You send specs to five suppliers and wait
- Three weeks later, you have two responses—neither with pricing
- You finally get a quote, only to learn delivery is 40 weeks out

Welcome to transformer procurement in 2026. Despite being critical infrastructure, buying a transformer feels like it's stuck in 1996.

## Why Is It So Hard?

### 1. Fragmented Global Market

There are hundreds of transformer manufacturers worldwide—from global giants like ABB, Siemens, and Hitachi Energy to regional players in India, China, Korea, Mexico, and beyond. Each serves different markets, voltage classes, and capacity ranges.

**The problem**: No single source knows what's available across all these manufacturers. You're left cold-calling suppliers, hoping someone has what you need.

### 2. Nobody Lists Inventory

Unlike almost every other industry, transformer manufacturers and distributors rarely publish real-time inventory.

**Why?** A few reasons:
- Transformers are often built to order
- Pricing is "market dependent" (they don't want competitors to see)
- Sales teams prefer phone calls to self-service
- Legacy systems weren't built for e-commerce

**The result**: You can't browse, compare, and buy. You have to call, email, wait, and hope.

### 3. Custom Specs = Long Quote Cycles

Every transformer application is slightly different:
- Voltage combinations
- kVA ratings
- Impedance requirements
- Cooling class
- BIL levels
- Tap configurations
- Enclosure type
- Testing requirements

Even a "standard" unit needs engineering review to confirm it meets your specs. That takes time—typically 1-3 weeks just to get a quote.

**Multiply that by 5 suppliers** and you're spending a month just to understand your options.

### 4. Extended Manufacturing Lead Times

Even after you choose a supplier and place an order, you're looking at:

| Transformer Type | Typical Lead Time |
|-----------------|------------------|
| Small distribution (< 500 kVA) | 12-20 weeks |
| Medium distribution (500-2500 kVA) | 16-28 weeks |
| Large distribution (> 2500 kVA) | 24-36 weeks |
| Power/substation (> 10 MVA) | 40-72 weeks |

That's not a typo. A substation transformer ordered today might not arrive until next year.

**Why so long?**
- Raw material constraints (grain-oriented electrical steel)
- Skilled labor shortages in manufacturing
- Factory backlogs from infrastructure investment
- Testing and quality assurance takes time

### 5. Opaque Pricing

Transformer pricing is notoriously opaque. Two quotes for the same spec can vary by 30-50%. Factors affecting price include:

- Manufacturer's current capacity utilization
- Raw material costs at time of order
- Shipping distance and logistics
- Your relationship with the supplier
- How badly they want the order

Without pricing transparency, you can't budget accurately or know if you're getting a fair deal.

## The Real Cost of This Broken System

### Project Delays

When you can't get equipment on time, projects slip. A 6-week delay waiting for a transformer quote can cascade into:
- Missed construction windows
- Delayed revenue (for commercial projects)
- Contractor schedule conflicts
- Penalty clauses triggered

### Overpaying

Without market visibility, you often accept the first available option—regardless of price. Procurement teams report overpaying 15-25% simply because they didn't have time to shop around.

### Settling for Wrong Specs

When the "right" transformer has a 50-week lead time, you might settle for something that almost works. That compromise can mean:
- Lower efficiency (higher operating costs)
- Reduced capacity margin
- Compatibility issues down the road

### Emergency Failures Are Catastrophic

When a transformer fails unexpectedly, the scramble begins. Without inventory visibility, finding a replacement fast is nearly impossible. Facilities have paid 2-3x market price for emergency replacements—if they can find one at all.

## What Smart Buyers Do Differently

### Start Early—Very Early

Add 25% to whatever lead time you're quoted. If your project needs power in 12 months, start procurement now, not in 6 months.

### Get Multiple Quotes Simultaneously

Don't wait for one supplier to respond before contacting others. Send your specs to 5-7 suppliers on day one. Yes, it's more work upfront, but it compresses your timeline.

### Be Flexible on Manufacturer

Brand loyalty is expensive in a supply-constrained market. A tier-2 manufacturer with 16-week delivery often beats a tier-1 manufacturer with 40-week delivery.

### Consider Refurbished Equipment

Quality refurbished transformers can cut lead times dramatically. For non-critical applications or temporary needs, a reconditioned unit at 50% of new cost with 2-week delivery might be the right call.

### Maintain Emergency Stock

If transformers are critical to your operation, keep spares. Yes, it ties up capital. But the cost of a spare is nothing compared to extended downtime.

### Use a Transformer Marketplace

This is why services like FluxCo exist. Instead of calling dozens of suppliers, you get:

- **Visible inventory**: See what's actually available now
- **Multiple manufacturers**: One search across global suppliers
- **Real pricing**: Transparent quotes, not "call for pricing"
- **Faster quotes**: Hours, not weeks
- **Expert support**: Engineers who speak transformer, not just sales reps

## The Market Is Changing

The transformer industry is slowly modernizing. Driven by:

- **Data center demand**: Hyperscalers expect e-commerce buying experiences
- **Renewable energy growth**: Solar and wind developers need volume procurement
- **Grid modernization**: Utilities replacing aging infrastructure at scale
- **New market entrants**: Companies bringing tech-forward approaches

In 5 years, buying a transformer might actually be straightforward. Until then, smart procurement means working around the system's limitations.

## How FluxCo Helps

We built FluxCo because we lived this frustration. Our platform aggregates inventory from manufacturers globally, shows real-time availability, and gets you quotes in hours instead of weeks.

**What we offer:**
- [Live inventory](/inventory) you can actually browse
- Quotes within 24 hours, not 3 weeks
- Access to manufacturers you've never heard of (but should)
- Engineering support to spec the right unit
- EPC services if you need installation too

[See what's in stock now](/inventory) or [tell us what you need](#contact).
`,
  },
  {
    slug: "is-your-transformer-really-made-in-america",
    title: "That 'Made in America' Transformer? It Probably Isn't.",
    description:
      "FEOC compliance is now critical for clean energy projects, but many transformer suppliers obscure where units are actually manufactured. Here's how to see through the supply chain.",
    category: "industry",
    publishedAt: "2026-01-30",
    readTime: "8 min read",
    keywords: [
      "FEOC compliance",
      "made in america transformer",
      "transformer country of origin",
      "domestic content requirements",
      "IRA transformer requirements",
      "foreign entity of concern",
      "transformer supply chain",
    ],
    content: `
## The Uncomfortable Truth About Transformer Origins

You just signed a contract for a new transformer. The sales rep assured you it's "domestic" or "made in America." You checked the box on your procurement form and moved on.

**Here's the problem**: That transformer might be shipping from a facility in Mexico. Or assembled in the US from a core wound in China. Or built by a company with significant Chinese government ownership.

And if you're building a project that needs Inflation Reduction Act (IRA) tax credits, that could cost you millions.

## What Is FEOC and Why Should You Care?

FEOC stands for **Foreign Entity of Concern**. Under the IRA's clean energy provisions, projects claiming certain tax credits cannot use components from entities that are:

- Owned or controlled by governments of China, Russia, North Korea, or Iran
- Headquartered in those countries
- Subject to their jurisdiction in ways that compromise independence

This applies to battery storage projects (Section 45X), EV charging infrastructure, and increasingly to transformers used in renewable energy and grid storage applications.

**The stakes are real**: The domestic content bonus alone is worth 10% of the project's tax credit value. For a $50 million solar installation, that's $5 million you could lose by using the wrong transformer.

## How Suppliers Obscure Country of Origin

### The "Assembled In" Loophole

A transformer might be "assembled in the USA" but contain:
- A core manufactured in China
- Windings from Mexico
- Bushings from Korea
- A tank fabricated in India

The final nameplate says "Made in USA" but the substantial transformation happened elsewhere. For FEOC purposes, this matters.

### The Shell Company Structure

Some manufacturers have complex corporate structures specifically designed to obscure beneficial ownership:
- US-incorporated subsidiary
- Owned by a holding company in Singapore
- Which is majority owned by a Chinese state enterprise

The sales team doesn't mention this. The website shows American flags. But due diligence reveals the truth.

### The "We Have a US Factory" Claim

Yes, they have a facility in Texas. But that facility does final assembly and testing. The cores—the most labor-intensive and value-added component—ship from their main factory in Jiangsu Province.

### Joint Ventures and Licensing

Major brands sometimes license manufacturing to overseas partners. That transformer might bear a familiar American or European name but be entirely manufactured by a FEOC-affiliated company under license.

## Real Examples (Names Changed)

**Case 1**: A data center developer ordered 12 padmount transformers from a well-known brand. Due diligence later revealed the specific product line was manufactured in a Chinese facility owned by a state-backed enterprise. The developer had to source replacements at premium prices to maintain their tax credit eligibility.

**Case 2**: A utility-scale solar project specified "domestic content" transformers. The supplier provided units from their "American" facility—which turned out to be a final assembly operation. Cores were manufactured in China. The project lost its domestic content bonus.

**Case 3**: An EV charging network operator assumed their equipment supplier was FEOC-compliant because headquarters was in Germany. A subsidiary in their supply chain had 40% ownership by a Chinese battery manufacturer with state ties.

## How to Actually Verify Transformer Origin

### Ask the Right Questions

Don't accept "Made in USA" at face value. Ask specifically:

1. **Where is the core manufactured?** (This is the key component)
2. **Where are windings produced?**
3. **What percentage of value-added occurs domestically?**
4. **Who is the ultimate beneficial owner of the manufacturing entity?**
5. **Are any manufacturing facilities located in FEOC countries?**
6. **Does any FEOC have ownership stake >25% in any entity in the supply chain?**

### Request Documentation

Legitimate suppliers can provide:
- Country of origin certificates
- Supply chain attestations
- Corporate ownership disclosures
- Manufacturing facility addresses
- Third-party compliance certifications

If a supplier gets defensive or vague when you ask, that's a red flag.

### Check Corporate Registrations

Use SEC filings, state business registrations, and international corporate databases to trace ownership. For significant purchases, consider engaging a compliance firm to conduct due diligence.

### Look at Shipping Records

Import records are public. If a "domestic" manufacturer has regular container shipments from Qingdao or Shenzhen, ask what's in those containers.

## The Compliance Landscape Is Tightening

This isn't going away. If anything, requirements are getting stricter:

- **2024**: Initial FEOC guidance for battery components
- **2025**: Expanded definitions and stricter enforcement
- **2026**: Treasury clarifications on transformer applicability
- **2027+**: Likely extension to broader grid infrastructure

Companies that invest in genuinely domestic supply chains now will have a competitive advantage as requirements tighten.

## What This Means for Your Next Transformer Purchase

### For Clean Energy Projects

If you're building solar, wind, storage, or EV infrastructure that will claim IRA credits:

1. **Make FEOC compliance a bid requirement**, not an afterthought
2. **Verify claims independently**—don't trust sales assurances
3. **Document everything**—you may need to prove compliance years later
4. **Build in lead time**—truly domestic options may have longer delivery

### For All Buyers

Even if IRA credits don't apply to your project today:

- **Future-proof your procurement**—regulations expand
- **Reduce supply chain risk**—geopolitical tensions affect imports
- **Support domestic manufacturing**—if that's important to your organization

## How FluxCo Helps

We've built FEOC compliance verification into our platform because we saw too many buyers get burned.

**What we provide:**
- **Verified country of origin** for every unit in our inventory
- **Supply chain transparency** showing where components are manufactured
- **Ownership attestations** from manufacturers
- **Compliance documentation** ready for your tax credit applications
- **Filtered search** to show only FEOC-compliant options

Don't find out your "American" transformer isn't American after you've already installed it.

[Browse FEOC-compliant inventory](/inventory) or [ask our team about compliance verification](#contact).
`,
  },
  {
    slug: "ira-tax-credits-transformers-domestic-content",
    title: "The Tax Credits You're Leaving on the Table: IRA Incentives for US-Made Transformers",
    description:
      "The Inflation Reduction Act offers significant tax credit bonuses for projects using domestically manufactured equipment—including transformers. Here's what you need to know to capture these incentives.",
    category: "industry",
    publishedAt: "2026-01-29",
    readTime: "6 min read",
    keywords: [
      "IRA tax credits",
      "domestic content bonus",
      "transformer tax incentives",
      "inflation reduction act",
      "clean energy tax credits",
      "made in america bonus",
      "renewable energy incentives",
    ],
    content: `
## Billions in Incentives, Often Overlooked

The Inflation Reduction Act (IRA) created the largest clean energy investment in American history. But many project developers are leaving money on the table by overlooking one key provision: the **domestic content bonus**.

For projects that meet domestic manufacturing requirements, the IRA adds a 10% bonus to the base tax credit. On a utility-scale solar project, that could mean an extra $5-15 million. For a data center power upgrade, potentially more.

And transformers? They're a key component that can make or break your domestic content qualification.

## How the Domestic Content Bonus Works

### The Basic Structure

The IRA's clean energy tax credits (like the Investment Tax Credit and Production Tax Credit) have a base value. Meeting domestic content requirements adds 10 percentage points:

| Credit Type | Base Rate | With Domestic Content |
|-------------|-----------|----------------------|
| ITC (Investment Tax Credit) | 30% | 40% |
| PTC (Production Tax Credit) | 100% | 110% |

For a $100 million solar project claiming the ITC, that's the difference between a $30 million credit and a $40 million credit.

### What Qualifies as "Domestic"

The domestic content requirement has two parts:

**1. Steel and Iron**: 100% of structural steel and iron must be produced in the US (melted, poured, and manufactured domestically).

**2. Manufactured Products**: A percentage of manufactured components (by cost) must be domestic. This threshold increases over time:
- 2024-2025: 40%
- 2026: 45%
- 2027+: 55%

Transformers fall under "manufactured products." If your transformer is genuinely US-made, it contributes to hitting that threshold.

## Transformers: A High-Value Component

Here's why transformers matter so much for domestic content calculations:

### They're Expensive

Transformers often represent 5-15% of total project equipment cost. A $2 million substation transformer on a $30 million project is a significant line item.

### They're Binary

Either your transformer counts as domestic or it doesn't. There's no partial credit. Getting this right on a high-value component swings your overall percentage significantly.

### They're Often Overlooked

Project developers focus domestic content efforts on solar panels, wind turbines, and batteries. Transformers get ordered late with less scrutiny—and often default to imported units.

## Calculating Your Domestic Content Percentage

Here's a simplified example:

**$50 Million Solar Project Equipment Breakdown:**

| Component | Cost | Domestic? | Counts Toward Threshold |
|-----------|------|-----------|------------------------|
| Solar panels | $25M | Yes (US manufactured) | $25M |
| Inverters | $8M | No (imported) | $0 |
| Racking | $5M | Yes (US steel/assembly) | $5M |
| Transformers | $4M | ??? | ??? |
| Electrical BOS | $4M | Mixed | $2M |
| Other | $4M | Mixed | $1M |

**Scenario A**: Import transformers from Mexico
- Domestic total: $33M of $50M = 66%
- Meets 55% threshold: Yes (but barely)

**Scenario B**: Source US-manufactured transformers
- Domestic total: $37M of $50M = 74%
- Meets 55% threshold: Yes (comfortable margin)

In Scenario A, you hit the threshold but have no buffer for audit adjustments. In Scenario B, you have a comfortable margin that protects your credit.

## The Cost-Benefit Math

"But US-made transformers cost more!"

Sometimes. Let's do the math:

**Project**: $75 million solar installation
**Base ITC**: $22.5 million (30%)
**Domestic content bonus**: $7.5 million (additional 10%)

**Transformer decision**:
- Imported transformer: $1.5 million
- US-made transformer: $1.9 million
- Premium for domestic: $400,000

**Net benefit of going domestic**: $7.5M - $400K = **$7.1 million**

Even if the domestic transformer costs 25% more, you're still $7.1 million ahead by capturing the bonus.

## Which Projects Qualify?

The domestic content bonus applies to projects claiming:

- **Investment Tax Credit (ITC)**: Solar, storage, offshore wind, fuel cells, and more
- **Production Tax Credit (PTC)**: Wind, solar (if elected), geothermal, hydropower
- **Advanced Manufacturing Credit (45X)**: Manufacturing facilities for clean energy components
- **Clean Fuel Production Credit (45Z)**: Sustainable aviation fuel and other clean fuels

If your project is claiming any of these credits, transformer sourcing affects your eligibility for the bonus.

## Common Mistakes That Cost Money

### 1. Assuming "North American" Counts

It doesn't. Mexico and Canada are not "domestic" for IRA purposes. A transformer from Monterrey doesn't qualify, even though it might have favorable trade status under USMCA.

### 2. Not Documenting Upfront

The IRS requires contemporaneous documentation of domestic content. If you don't get certificates of origin and manufacturer attestations at purchase time, reconstructing proof later is difficult.

### 3. Specifying Too Late

By the time you realize you need a domestic transformer, lead times may force you into imports. Specify domestic sourcing at project inception, not final procurement.

### 4. Taking Sales Rep Claims at Face Value

"Yeah, it's American-made" from a sales rep won't satisfy an IRS audit. Get written attestations with specific manufacturing location, component sourcing, and ownership disclosures.

### 5. Ignoring FEOC Rules

Even if a transformer is physically made in the US, if the manufacturer is a Foreign Entity of Concern (Chinese state ownership, etc.), you may be disqualified. [Read more about FEOC compliance](/resources/is-your-transformer-really-made-in-america).

## How to Capture the Bonus

### Step 1: Know Your Threshold

Calculate what percentage domestic content you need to hit based on your project's placed-in-service date. Build in a 5-10% buffer for audit protection.

### Step 2: Prioritize High-Value Components

Focus domestic sourcing efforts on the biggest line items: panels, turbines, batteries, inverters, and transformers. These move the needle most.

### Step 3: Specify Early

Include domestic content requirements in your RFPs and bid documents from day one. This gives suppliers time to source appropriately.

### Step 4: Get Documentation

Require from transformer suppliers:
- Manufacturer's affidavit of US manufacturing
- Country of origin for major components (core, windings, tank)
- Corporate ownership disclosure
- Facility address where transformation occurs

### Step 5: Maintain Records

Keep all domestic content documentation for the IRS's required retention period (typically 6 years from the filing date of the return claiming the credit).

## What FluxCo Offers

We've made it easy to source IRA-compliant transformers:

- **Pre-verified domestic inventory**: Every unit marked "US-Made" has verified manufacturing documentation
- **Tax credit documentation packages**: Ready for your IRA filing
- **Domestic content calculations**: Our team can help you model scenarios
- **Compliance certificates**: Manufacturer attestations included with purchase

Don't leave $7 million on the table because of a transformer.

[Browse US-made inventory](/inventory) or [talk to our team about domestic content requirements](#contact).
`,
  },
  {
    slug: "doe-2027-efficiency-standards-transformer-guide",
    title: "DOE 2027 Efficiency Mandates: Why Your Standard Transformer Won't Be Legal Next Year",
    description:
      "New Department of Energy efficiency standards take effect in 2027, requiring higher-efficiency transformers for most applications. Here's what's changing and how to prepare.",
    category: "technical",
    publishedAt: "2026-01-28",
    readTime: "7 min read",
    keywords: [
      "DOE transformer efficiency",
      "2027 transformer standards",
      "transformer efficiency requirements",
      "distribution transformer regulations",
      "energy efficient transformers",
      "DOE efficiency mandate",
      "transformer compliance 2027",
    ],
    content: `
## A Major Regulatory Shift Is Coming

On January 1, 2027, new Department of Energy (DOE) efficiency standards take effect for distribution transformers. These aren't minor tweaks—they represent the most significant efficiency increase in over a decade.

If you're planning projects that will procure transformers in late 2026 or 2027, you need to understand what's changing. And if you're buying transformers now, you should consider whether future-proofing makes sense.

## What's Changing in 2027

The DOE's new efficiency standards increase minimum efficiency requirements for liquid-immersed and dry-type distribution transformers. The key changes:

### Liquid-Immersed Transformers

| kVA Rating | Current Standard | 2027 Standard | Efficiency Increase |
|------------|-----------------|---------------|---------------------|
| 50 kVA | 98.6% | 98.9% | +0.3% |
| 150 kVA | 98.9% | 99.1% | +0.2% |
| 500 kVA | 99.1% | 99.3% | +0.2% |
| 1000 kVA | 99.2% | 99.4% | +0.2% |
| 2500 kVA | 99.4% | 99.5% | +0.1% |

### Dry-Type Transformers

| kVA Rating | Current Standard | 2027 Standard | Efficiency Increase |
|------------|-----------------|---------------|---------------------|
| 45 kVA | 97.7% | 98.2% | +0.5% |
| 150 kVA | 98.3% | 98.7% | +0.4% |
| 500 kVA | 98.8% | 99.1% | +0.3% |
| 1000 kVA | 99.0% | 99.2% | +0.2% |

These percentages may look small, but they have big implications.

## Why 0.2% Matters More Than You Think

### The Math of Transformer Losses

A 500 kVA transformer at 99.1% efficiency loses 0.9% of throughput power as heat. At 99.3% efficiency, losses drop to 0.7%.

That's a **22% reduction in losses**.

For a transformer running at 50% average load, 24/7/365:
- Annual throughput: ~2.19 million kWh
- Losses at 99.1%: ~19,700 kWh/year
- Losses at 99.3%: ~15,300 kWh/year
- **Annual savings: ~4,400 kWh**

At $0.10/kWh, that's $440/year. Over a 30-year transformer life, that's $13,200 in energy savings from one unit.

### Multiply Across Your Fleet

Utilities and large commercial operators don't have one transformer—they have thousands. A utility with 10,000 distribution transformers could save:
- 44 million kWh annually
- $4.4 million per year in reduced losses
- Equivalent to powering 4,000 homes

## What This Means for Manufacturers

Meeting the new standards requires changes to transformer design:

### More Core Steel

Higher efficiency means lower core losses, which typically requires:
- More grain-oriented electrical steel (GOES)
- Higher-grade steel (moving from M3 to M2 or better)
- Larger core cross-sections

This increases material costs and physical size.

### Better Windings

Reducing I²R losses in windings means:
- Larger conductor cross-sections
- More copper (or aluminum)
- Sometimes redesigned winding geometry

### Price Implications

Industry estimates suggest 2027-compliant transformers will cost:
- 10-15% more for liquid-immersed units
- 15-25% more for dry-type units

These premiums should decrease over time as production scales, but expect sticker shock initially.

### Supply Chain Strain

The transformer industry is already capacity-constrained. Adding a mandatory design change creates:
- Engineering workload at manufacturers
- Retooling for new core dimensions
- Potential bottlenecks in high-grade steel supply
- Testing backlogs as new designs get certified

Lead times, already long, may extend further in the 2026-2027 transition period.

## The 2029 Question

The DOE hasn't finalized standards beyond 2027, but signals suggest another efficiency increase around 2029-2030. The pattern:

- **2010**: First modern efficiency standards
- **2016**: Updated standards (current baseline)
- **2027**: New standards taking effect
- **2029-2030**: Likely next revision

If you're specifying transformers for long-life installations, consider whether buying to 2027 standards now avoids another upgrade cycle in three years.

## Compliance Timeline

### What's Legal Now (Through 2026)

Transformers manufactured before January 1, 2027 can be sold indefinitely under current standards. There's no requirement to remove or replace existing equipment.

### The January 2027 Cutoff

Starting January 1, 2027:
- Newly manufactured transformers must meet new efficiency standards
- Existing inventory manufactured before 2027 can still be sold
- Installed equipment is grandfathered indefinitely

### Strategy Implications

Some buyers are stockpiling pre-2027 transformers to:
- Avoid higher costs of compliant units
- Ensure supply during the transition
- Defer the efficiency premium until later purchases

Others are specifying 2027-compliant units now to:
- Future-proof installations
- Capture lifecycle energy savings
- Avoid mixed-fleet maintenance complexity

## How to Prepare

### For 2026 Purchases

**Option A**: Buy current-standard units and save 10-15%
- Pro: Lower upfront cost
- Con: Slightly higher lifecycle energy cost
- Con: Mixed fleet if you buy post-2027 later

**Option B**: Specify 2027-compliant units early
- Pro: Maximum energy savings over transformer life
- Pro: Consistent fleet specifications
- Con: Higher upfront cost
- Con: Possible availability issues as manufacturers transition

### For 2027+ Purchases

You'll be buying 2027-compliant units regardless. Focus on:
- Locking in pricing early (premiums may spike initially)
- Extending lead times in project schedules
- Verifying manufacturer certification

### For Long-Term Planning

Consider total cost of ownership (TCO):

| Transformer | Upfront Cost | 20-Year Energy Cost | TCO |
|-------------|--------------|---------------------|-----|
| Current standard | $50,000 | $9,000 | $59,000 |
| 2027 standard | $57,500 | $7,000 | $64,500 |

In this example, the efficient unit costs more over 20 years. But extend to 30 years and the math shifts. Add carbon cost or utility rate increases, and it shifts further.

## Industry Impact by Sector

### Utilities

Utilities replacing aging infrastructure face a choice: accelerate replacements pre-2027 or pay premiums after. Many are evaluating fleet-wide replacement strategies.

### Data Centers

Data centers care about efficiency at every level. The 0.2% loss reduction contributes to PUE improvements. Many data center operators will specify 2027 standards immediately.

### Renewable Energy

Solar and wind projects have 20-30 year operating lives. Specifying high-efficiency transformers at project inception captures maximum lifecycle value.

### Industrial

Industrial operators with stable loads and long equipment lifecycles often favor efficiency. But tight project budgets may push some toward current-standard units while available.

## FluxCo's Approach

We're stocking both current-standard and 2027-compliant inventory so you can make the right choice for your project:

- **Current-standard units**: Available now at current pricing
- **2027-compliant units**: Pre-ordering from manufacturers with certified designs
- **Side-by-side comparisons**: See specs and pricing for both options
- **TCO calculator**: Model your specific use case

Our engineering team can help you evaluate the trade-offs for your application.

[View efficiency-rated inventory](/inventory) or [discuss your project requirements](#contact).
`,
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getArticlesByCategory(category: Article["category"]): Article[] {
  return articles.filter((article) => article.category === category);
}

export function getAllArticles(): Article[] {
  return articles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
