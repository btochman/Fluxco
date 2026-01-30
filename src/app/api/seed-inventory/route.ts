import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const inventoryData = [
  // Distribution Transformers - New
  { sku: 'FLX-D-001', type: 'new', category: 'Distribution', manufacturer: 'ABB', model: 'DTR-500', capacity: '500 kVA', voltage: '13.8kV/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: true, certifications: ['IEEE C57', 'DOE 2016'], location: 'Houston, TX', quantity: 5, available: true, price: '$28,500', condition: 'New', year_manufactured: 2024, notes: 'In stock, ready to ship' },
  { sku: 'FLX-D-002', type: 'new', category: 'Distribution', manufacturer: 'Siemens', model: 'DTTH-750', capacity: '750 kVA', voltage: '13.2kV/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: true, certifications: ['IEEE C57', 'DOE 2016'], location: 'Houston, TX', quantity: 3, available: true, price: '$35,200', condition: 'New', year_manufactured: 2024, notes: 'Lead time 2-3 weeks' },
  { sku: 'FLX-D-003', type: 'new', category: 'Distribution', manufacturer: 'Eaton', model: 'DT-1000', capacity: '1000 kVA', voltage: '13.8kV/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: true, certifications: ['IEEE C57', 'DOE 2016', 'UL Listed'], location: 'Dallas, TX', quantity: 4, available: true, price: '$42,800', condition: 'New', year_manufactured: 2024, notes: null },
  { sku: 'FLX-D-004', type: 'new', category: 'Distribution', manufacturer: 'GE', model: 'Prolec-1500', capacity: '1500 kVA', voltage: '13.8kV/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: true, certifications: ['IEEE C57', 'DOE 2016'], location: 'Phoenix, AZ', quantity: 2, available: true, price: '$58,500', condition: 'New', year_manufactured: 2024, notes: 'Premium efficiency' },
  { sku: 'FLX-D-005', type: 'new', category: 'Distribution', manufacturer: 'Howard Industries', model: 'HPS-2000', capacity: '2000 kVA', voltage: '13.8kV/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: true, certifications: ['IEEE C57', 'DOE 2016'], location: 'Laurel, MS', quantity: 6, available: true, price: '$72,000', condition: 'New', year_manufactured: 2024, notes: 'Made in USA' },
  { sku: 'FLX-D-006', type: 'new', category: 'Distribution', manufacturer: 'ABB', model: 'DTR-2500', capacity: '2500 kVA', voltage: '13.8kV/4160V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: true, certifications: ['IEEE C57', 'DOE 2016'], location: 'Houston, TX', quantity: 2, available: true, price: '$89,500', condition: 'New', year_manufactured: 2024, notes: null },
  { sku: 'FLX-D-007', type: 'new', category: 'Distribution', manufacturer: 'Schneider Electric', model: 'Minera-300', capacity: '300 kVA', voltage: '4160V/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: true, certifications: ['IEEE C57', 'DOE 2016'], location: 'Atlanta, GA', quantity: 8, available: true, price: '$19,800', condition: 'New', year_manufactured: 2024, notes: 'Compact design' },
  { sku: 'FLX-D-008', type: 'new', category: 'Distribution', manufacturer: 'Siemens', model: 'GEAFOL-225', capacity: '225 kVA', voltage: '480V/208V', frequency: 60, phases: 3, cooling_class: 'AN', feoc_compliant: true, certifications: ['IEEE C57', 'UL Listed'], location: 'Chicago, IL', quantity: 4, available: true, price: '$15,200', condition: 'New', year_manufactured: 2024, notes: 'Dry type' },

  // Distribution Transformers - Refurbished
  { sku: 'FLX-D-101', type: 'refurbished', category: 'Distribution', manufacturer: 'Westinghouse', model: 'Type C', capacity: '500 kVA', voltage: '13.8kV/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: false, certifications: ['IEEE C57'], location: 'Houston, TX', quantity: 2, available: true, price: '$14,500', condition: 'Excellent', year_manufactured: 2018, notes: 'Fully reconditioned, new oil' },
  { sku: 'FLX-D-102', type: 'refurbished', category: 'Distribution', manufacturer: 'GE', model: 'Prolec-750', capacity: '750 kVA', voltage: '13.2kV/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: false, certifications: ['IEEE C57'], location: 'Dallas, TX', quantity: 3, available: true, price: '$19,800', condition: 'Very Good', year_manufactured: 2019, notes: 'Tested and certified' },
  { sku: 'FLX-D-103', type: 'refurbished', category: 'Distribution', manufacturer: 'ABB', model: 'DTR-1000', capacity: '1000 kVA', voltage: '13.8kV/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: false, certifications: ['IEEE C57'], location: 'Phoenix, AZ', quantity: 1, available: true, price: '$24,500', condition: 'Excellent', year_manufactured: 2020, notes: 'Low hours, like new' },
  { sku: 'FLX-D-104', type: 'refurbished', category: 'Distribution', manufacturer: 'Cooper', model: 'Envirotemp', capacity: '1500 kVA', voltage: '13.8kV/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: false, certifications: ['IEEE C57'], location: 'Denver, CO', quantity: 2, available: true, price: '$32,000', condition: 'Good', year_manufactured: 2017, notes: 'New bushings installed' },
  { sku: 'FLX-D-105', type: 'refurbished', category: 'Distribution', manufacturer: 'Howard Industries', model: 'HPS-2000', capacity: '2000 kVA', voltage: '13.8kV/4160V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: false, certifications: ['IEEE C57'], location: 'Laurel, MS', quantity: 1, available: true, price: '$45,000', condition: 'Very Good', year_manufactured: 2019, notes: '5-year warranty available' },

  // Power Transformers - New
  { sku: 'FLX-P-001', type: 'new', category: 'Power', manufacturer: 'ABB', model: 'TrafoStar-5', capacity: '5 MVA', voltage: '69kV/13.8kV', frequency: 60, phases: 3, cooling_class: 'ONAN/ONAF', feoc_compliant: true, certifications: ['IEEE C57.12', 'ANSI'], location: 'Houston, TX', quantity: 1, available: true, price: '$285,000', condition: 'New', year_manufactured: 2024, notes: 'Substation class' },
  { sku: 'FLX-P-002', type: 'new', category: 'Power', manufacturer: 'Siemens', model: 'TUNORMA-7.5', capacity: '7.5 MVA', voltage: '69kV/13.8kV', frequency: 60, phases: 3, cooling_class: 'ONAN/ONAF', feoc_compliant: true, certifications: ['IEEE C57.12', 'ANSI'], location: 'Charlotte, NC', quantity: 1, available: true, price: '$385,000', condition: 'New', year_manufactured: 2024, notes: '8-week lead time' },
  { sku: 'FLX-P-003', type: 'new', category: 'Power', manufacturer: 'GE', model: 'Prolec-10', capacity: '10 MVA', voltage: '115kV/13.8kV', frequency: 60, phases: 3, cooling_class: 'ONAN/ONAF', feoc_compliant: true, certifications: ['IEEE C57.12', 'ANSI', 'IEC'], location: 'Houston, TX', quantity: 1, available: true, price: '$520,000', condition: 'New', year_manufactured: 2024, notes: null },
  { sku: 'FLX-P-004', type: 'new', category: 'Power', manufacturer: 'Hitachi Energy', model: 'PowerT-15', capacity: '15 MVA', voltage: '138kV/13.8kV', frequency: 60, phases: 3, cooling_class: 'ONAN/ONAF/OFAF', feoc_compliant: true, certifications: ['IEEE C57.12', 'ANSI', 'IEC'], location: 'Raleigh, NC', quantity: 1, available: true, price: '$725,000', condition: 'New', year_manufactured: 2024, notes: 'Premium grade' },
  { sku: 'FLX-P-005', type: 'new', category: 'Power', manufacturer: 'ABB', model: 'TrafoStar-20', capacity: '20 MVA', voltage: '138kV/34.5kV', frequency: 60, phases: 3, cooling_class: 'ONAF/OFAF', feoc_compliant: true, certifications: ['IEEE C57.12', 'ANSI'], location: 'Houston, TX', quantity: 1, available: true, price: '$890,000', condition: 'New', year_manufactured: 2024, notes: 'Factory tested' },
  { sku: 'FLX-P-006', type: 'new', category: 'Power', manufacturer: 'Siemens', model: 'TUNORMA-25', capacity: '25 MVA', voltage: '230kV/69kV', frequency: 60, phases: 3, cooling_class: 'ONAF/OFAF', feoc_compliant: true, certifications: ['IEEE C57.12', 'ANSI', 'IEC'], location: 'Atlanta, GA', quantity: 1, available: true, price: '$1,150,000', condition: 'New', year_manufactured: 2024, notes: '12-week lead time' },

  // Power Transformers - Refurbished
  { sku: 'FLX-P-101', type: 'refurbished', category: 'Power', manufacturer: 'Westinghouse', model: 'Type HSP', capacity: '5 MVA', voltage: '69kV/13.8kV', frequency: 60, phases: 3, cooling_class: 'ONAN/ONAF', feoc_compliant: false, certifications: ['IEEE C57.12'], location: 'Houston, TX', quantity: 1, available: true, price: '$145,000', condition: 'Very Good', year_manufactured: 2015, notes: 'Complete overhaul 2023' },
  { sku: 'FLX-P-102', type: 'refurbished', category: 'Power', manufacturer: 'GE', model: 'Type H', capacity: '7.5 MVA', voltage: '69kV/13.8kV', frequency: 60, phases: 3, cooling_class: 'ONAN/ONAF', feoc_compliant: false, certifications: ['IEEE C57.12'], location: 'Dallas, TX', quantity: 1, available: true, price: '$195,000', condition: 'Excellent', year_manufactured: 2017, notes: 'Low hours, utility surplus' },
  { sku: 'FLX-P-103', type: 'refurbished', category: 'Power', manufacturer: 'ABB', model: 'TrafoStar-10', capacity: '10 MVA', voltage: '115kV/13.8kV', frequency: 60, phases: 3, cooling_class: 'ONAN/ONAF', feoc_compliant: false, certifications: ['IEEE C57.12'], location: 'Phoenix, AZ', quantity: 1, available: true, price: '$275,000', condition: 'Good', year_manufactured: 2014, notes: 'New windings 2022' },
  { sku: 'FLX-P-104', type: 'refurbished', category: 'Power', manufacturer: 'Cooper', model: 'Kyle-20', capacity: '20 MVA', voltage: '138kV/13.8kV', frequency: 60, phases: 3, cooling_class: 'ONAF/OFAF', feoc_compliant: false, certifications: ['IEEE C57.12'], location: 'Denver, CO', quantity: 1, available: true, price: '$485,000', condition: 'Very Good', year_manufactured: 2016, notes: 'Utility decommission' },

  // Specialty Transformers - New
  { sku: 'FLX-S-001', type: 'new', category: 'Specialty', manufacturer: 'ABB', model: 'RESIBLOC', capacity: '1000 kVA', voltage: '13.8kV/480V', frequency: 60, phases: 3, cooling_class: 'AN', feoc_compliant: true, certifications: ['IEEE C57.12.51', 'UL'], location: 'Houston, TX', quantity: 3, available: true, price: '$68,000', condition: 'New', year_manufactured: 2024, notes: 'Cast resin dry type' },
  { sku: 'FLX-S-002', type: 'new', category: 'Specialty', manufacturer: 'Schneider Electric', model: 'Trihal', capacity: '1500 kVA', voltage: '13.8kV/480V', frequency: 60, phases: 3, cooling_class: 'AN', feoc_compliant: true, certifications: ['IEEE C57.12.51', 'UL', 'FM'], location: 'Chicago, IL', quantity: 2, available: true, price: '$92,000', condition: 'New', year_manufactured: 2024, notes: 'Fire resistant' },
  { sku: 'FLX-S-003', type: 'new', category: 'Specialty', manufacturer: 'GE', model: 'Prolec-ISO', capacity: '500 kVA', voltage: '480V/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: true, certifications: ['IEEE C57', 'UL'], location: 'Houston, TX', quantity: 4, available: true, price: '$38,500', condition: 'New', year_manufactured: 2024, notes: 'Isolation transformer' },
  { sku: 'FLX-S-004', type: 'new', category: 'Specialty', manufacturer: 'Hammond Power', model: 'HPS-Auto', capacity: '750 kVA', voltage: '480V/240V', frequency: 60, phases: 3, cooling_class: 'AN', feoc_compliant: true, certifications: ['CSA', 'UL'], location: 'Ontario, Canada', quantity: 5, available: true, price: '$24,800', condition: 'New', year_manufactured: 2024, notes: 'Autotransformer' },
  { sku: 'FLX-S-005', type: 'new', category: 'Specialty', manufacturer: 'Eaton', model: 'VPI-2000', capacity: '2000 kVA', voltage: '4160V/480V', frequency: 60, phases: 3, cooling_class: 'ANAF', feoc_compliant: true, certifications: ['IEEE C57.12.01', 'UL'], location: 'Pittsburgh, PA', quantity: 2, available: true, price: '$115,000', condition: 'New', year_manufactured: 2024, notes: 'VPI dry type' },
  { sku: 'FLX-S-006', type: 'new', category: 'Specialty', manufacturer: 'Siemens', model: 'GEAFOL-NEO', capacity: '2500 kVA', voltage: '13.8kV/480V', frequency: 60, phases: 3, cooling_class: 'AF', feoc_compliant: true, certifications: ['IEEE C57.12.51', 'UL', 'FM'], location: 'Atlanta, GA', quantity: 1, available: true, price: '$165,000', condition: 'New', year_manufactured: 2024, notes: 'Data center grade' },

  // Specialty Transformers - Refurbished
  { sku: 'FLX-S-101', type: 'refurbished', category: 'Specialty', manufacturer: 'ABB', model: 'RESIBLOC', capacity: '750 kVA', voltage: '4160V/480V', frequency: 60, phases: 3, cooling_class: 'AN', feoc_compliant: false, certifications: ['IEEE C57.12.51'], location: 'Houston, TX', quantity: 1, available: true, price: '$42,000', condition: 'Excellent', year_manufactured: 2020, notes: 'Minimal use' },
  { sku: 'FLX-S-102', type: 'refurbished', category: 'Specialty', manufacturer: 'Square D', model: 'DT-1500', capacity: '1500 kVA', voltage: '13.8kV/480V', frequency: 60, phases: 3, cooling_class: 'AA', feoc_compliant: false, certifications: ['IEEE C57', 'UL'], location: 'Dallas, TX', quantity: 2, available: true, price: '$55,000', condition: 'Very Good', year_manufactured: 2018, notes: 'Dry type, tested' },
  { sku: 'FLX-S-103', type: 'refurbished', category: 'Specialty', manufacturer: 'GE', model: 'Prolec-ISO', capacity: '1000 kVA', voltage: '480V/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: false, certifications: ['IEEE C57'], location: 'Phoenix, AZ', quantity: 1, available: true, price: '$28,500', condition: 'Good', year_manufactured: 2017, notes: 'Isolation transformer' },

  // Pad-mount Transformers
  { sku: 'FLX-PM-001', type: 'new', category: 'Distribution', manufacturer: 'Cooper', model: 'Envirotemp-PM', capacity: '500 kVA', voltage: '13.2kV/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: true, certifications: ['IEEE C57.12.34'], location: 'Houston, TX', quantity: 6, available: true, price: '$32,500', condition: 'New', year_manufactured: 2024, notes: 'Pad-mount, loop feed' },
  { sku: 'FLX-PM-002', type: 'new', category: 'Distribution', manufacturer: 'ABB', model: 'PadMount-750', capacity: '750 kVA', voltage: '13.8kV/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: true, certifications: ['IEEE C57.12.34'], location: 'Dallas, TX', quantity: 4, available: true, price: '$41,800', condition: 'New', year_manufactured: 2024, notes: 'Pad-mount, radial feed' },
  { sku: 'FLX-PM-003', type: 'new', category: 'Distribution', manufacturer: 'Howard Industries', model: 'HPS-PM-1000', capacity: '1000 kVA', voltage: '13.8kV/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: true, certifications: ['IEEE C57.12.34'], location: 'Laurel, MS', quantity: 3, available: true, price: '$52,500', condition: 'New', year_manufactured: 2024, notes: 'Three-phase pad-mount' },
  { sku: 'FLX-PM-004', type: 'refurbished', category: 'Distribution', manufacturer: 'GE', model: 'Prolec-PM', capacity: '750 kVA', voltage: '13.2kV/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: false, certifications: ['IEEE C57.12.34'], location: 'Phoenix, AZ', quantity: 2, available: true, price: '$24,800', condition: 'Very Good', year_manufactured: 2019, notes: 'Reconditioned pad-mount' },

  // Additional inventory
  { sku: 'FLX-D-009', type: 'new', category: 'Distribution', manufacturer: 'Eaton', model: 'DT-167', capacity: '167 kVA', voltage: '7200V/240V', frequency: 60, phases: 1, cooling_class: 'ONAN', feoc_compliant: true, certifications: ['IEEE C57', 'DOE 2016'], location: 'Houston, TX', quantity: 12, available: true, price: '$8,500', condition: 'New', year_manufactured: 2024, notes: 'Single phase' },
  { sku: 'FLX-D-010', type: 'new', category: 'Distribution', manufacturer: 'ABB', model: 'DTR-333', capacity: '333 kVA', voltage: '7200V/240V', frequency: 60, phases: 1, cooling_class: 'ONAN', feoc_compliant: true, certifications: ['IEEE C57', 'DOE 2016'], location: 'Dallas, TX', quantity: 8, available: true, price: '$12,800', condition: 'New', year_manufactured: 2024, notes: 'Single phase' },
  { sku: 'FLX-D-011', type: 'new', category: 'Distribution', manufacturer: 'Howard Industries', model: 'HPS-3000', capacity: '3000 kVA', voltage: '13.8kV/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: true, certifications: ['IEEE C57', 'DOE 2016'], location: 'Laurel, MS', quantity: 2, available: true, price: '$98,500', condition: 'New', year_manufactured: 2024, notes: 'Large distribution' },
  { sku: 'FLX-D-106', type: 'refurbished', category: 'Distribution', manufacturer: 'Siemens', model: 'DTTH-500', capacity: '500 kVA', voltage: '4160V/480V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: false, certifications: ['IEEE C57'], location: 'Chicago, IL', quantity: 3, available: true, price: '$16,500', condition: 'Good', year_manufactured: 2016, notes: 'Medium voltage' },
  { sku: 'FLX-D-107', type: 'refurbished', category: 'Distribution', manufacturer: 'Cooper', model: 'Envirotemp-2500', capacity: '2500 kVA', voltage: '13.8kV/4160V', frequency: 60, phases: 3, cooling_class: 'ONAN', feoc_compliant: false, certifications: ['IEEE C57'], location: 'Denver, CO', quantity: 1, available: true, price: '$52,000', condition: 'Excellent', year_manufactured: 2020, notes: 'Nearly new' },
];

export async function POST() {
  try {
    // Delete all existing inventory
    const { error: deleteError } = await supabaseAdmin
      .from("inventory")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Insert new inventory
    const { data, error: insertError } = await supabaseAdmin
      .from("inventory")
      .insert(inventoryData)
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const totalUnits = inventoryData.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      success: true,
      totalProducts: data?.length || 0,
      totalUnits,
      newCount: inventoryData.filter((i) => i.type === "new").length,
      refurbishedCount: inventoryData.filter((i) => i.type === "refurbished").length,
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
