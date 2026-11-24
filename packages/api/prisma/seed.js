const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  { slug: 'home-services', name: 'Home services', description: 'Repairs, maintenance and home improvement', sortOrder: 1, parentSlug: null, attributeSchema: [] },
  { slug: 'appliance-repair', name: 'Appliance repair', description: 'Fridges, boilers, washing machines and other appliances', sortOrder: 1, parentSlug: 'home-services', attributeSchema: [
    { key: 'brand', label: 'Brand', type: 'TEXT', required: true },
    { key: 'fault', label: 'What is broken?', type: 'TEXT', required: true },
    { key: 'underWarranty', label: 'Under warranty', type: 'BOOLEAN' },
  ] },
  { slug: 'painting', name: 'Painting', sortOrder: 2, parentSlug: 'home-services', attributeSchema: [
    { key: 'roomCount', label: 'Number of rooms', type: 'NUMBER', required: true },
    { key: 'surfaceArea', label: 'Surface area', type: 'NUMBER', unit: 'm²' },
    { key: 'paintType', label: 'Paint type', type: 'SELECT', options: ['Water-based', 'Solvent-based', 'Latex'] },
  ] },
  { slug: 'lock-repair', name: 'Door lock repair', sortOrder: 3, parentSlug: 'home-services', attributeSchema: [
    { key: 'lockType', label: 'Lock type', type: 'SELECT', required: true, options: ['Cylinder', 'Deadbolt', 'Smart lock', 'Other'] },
  ] },
  { slug: 'events', name: 'Events and temporary work', description: 'Staff and help for events and short-term jobs', sortOrder: 2, parentSlug: null, attributeSchema: [] },
  { slug: 'waiter', name: 'Waiter', sortOrder: 1, parentSlug: 'events', attributeSchema: [
    { key: 'eventDate', label: 'Event date', type: 'DATE', required: true },
    { key: 'startTime', label: 'Start time', type: 'TEXT', required: true },
    { key: 'endTime', label: 'End time', type: 'TEXT', required: true },
    { key: 'guests', label: 'Number of guests', type: 'NUMBER' },
    { key: 'dressCode', label: 'Dress code', type: 'TEXT' },
  ] },
  { slug: 'event-cleaner', name: 'Event cleaner', sortOrder: 2, parentSlug: 'events', attributeSchema: [
    { key: 'eventDate', label: 'Event date', type: 'DATE', required: true },
    { key: 'hours', label: 'Number of hours', type: 'NUMBER' },
  ] },
  { slug: 'rentals', name: 'Rentals', description: 'Vehicles, equipment, tools and furniture', sortOrder: 3, parentSlug: null, attributeSchema: [] },
  { slug: 'car-rental', name: 'Car rental', sortOrder: 1, parentSlug: 'rentals', attributeSchema: [
    { key: 'make', label: 'Make', type: 'TEXT', required: true },
    { key: 'model', label: 'Model', type: 'TEXT' },
    { key: 'fromDate', label: 'From', type: 'DATE', required: true },
    { key: 'toDate', label: 'To', type: 'DATE', required: true },
    { key: 'drivingLicenceYears', label: 'Years of driving experience', type: 'NUMBER' },
  ] },
  { slug: 'camera-rental', name: 'Camera and sound rental', sortOrder: 2, parentSlug: 'rentals', attributeSchema: [
    { key: 'gearType', label: 'Gear type', type: 'SELECT', required: true, options: ['Camera', 'Lens', 'Sound system', 'Lighting'] },
    { key: 'fromDate', label: 'From', type: 'DATE', required: true },
    { key: 'toDate', label: 'To', type: 'DATE', required: true },
  ] },
  { slug: 'professional-services', name: 'Professional services', sortOrder: 4, parentSlug: null, attributeSchema: [] },
  { slug: 'photographer', name: 'Photographer', sortOrder: 1, parentSlug: 'professional-services', attributeSchema: [
    { key: 'eventType', label: 'Event type', type: 'SELECT', required: true, options: ['Wedding', 'Portrait', 'Product', 'Corporate'] },
    { key: 'shootDate', label: 'Shoot date', type: 'DATE' },
    { key: 'deliverables', label: 'Expected deliverables', type: 'TEXT' },
  ] },
  { slug: 'developer', name: 'Developer', sortOrder: 2, parentSlug: 'professional-services', attributeSchema: [
    { key: 'technology', label: 'Main technology', type: 'TEXT', required: true },
    { key: 'experienceYears', label: 'Years of experience', type: 'NUMBER' },
  ] },
  { slug: 'tutor', name: 'Tutor', sortOrder: 3, parentSlug: 'professional-services', attributeSchema: [
    { key: 'subject', label: 'Subject', type: 'TEXT', required: true },
    { key: 'level', label: 'Level', type: 'SELECT', options: ['Beginner', 'Intermediate', 'Advanced'] },
  ] },
];

async function main() {
  for (const category of categories.filter((item) => item.parentSlug === null)) {
    const data = {
      name: category.name,
      description: category.description ?? null,
      sortOrder: category.sortOrder,
      attributeSchema: category.attributeSchema,
    };
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: data,
      create: { slug: category.slug, ...data },
    });
  }

  for (const category of categories.filter((item) => item.parentSlug !== null)) {
    const parent = await prisma.category.findUnique({
      where: { slug: category.parentSlug },
    });
    if (!parent) {
      throw new Error(`Missing parent category: ${category.parentSlug}`);
    }
    const data = {
      name: category.name,
      description: category.description ?? null,
      parentId: parent.id,
      sortOrder: category.sortOrder,
      attributeSchema: category.attributeSchema,
    };
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: data,
      create: { slug: category.slug, ...data },
    });
  }

  console.log(`Seeded ${categories.length} categories`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
