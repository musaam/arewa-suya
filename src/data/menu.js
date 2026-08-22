// ── Arewa Suya Spot Menu ──
// Authentic Kano-Style Suya · 100% Halal · Winnipeg

// Default image used for all items until unique photos are provided.
const DEFAULT_ITEM_IMAGE = '/menu-item.jpg'

export const menuCategories = [
  {
    id: 'suya-combos',
    name: 'Suya & Combos',
    items: [
      {
        id: 'suya-plate',
        name: 'Suya Plate',
        description: 'Suya + vegetables',
        price: 20.00,
        emoji: '🍖',
        image: DEFAULT_ITEM_IMAGE,
      },
      {
        id: 'suya-plate-combo-1',
        name: 'Suya Plate Combo 1',
        description: 'Suya + masa + zobo',
        price: 30.00,
        emoji: '🍖',
        image: DEFAULT_ITEM_IMAGE,
      },
      {
        id: 'suya-plate-combo-2',
        name: 'Suya Plate Combo 2',
        description: 'Suya + masa',
        price: 25.00,
        emoji: '🍖',
        image: DEFAULT_ITEM_IMAGE,
      },
    ],
  },
  {
    id: 'suya-bundle',
    name: 'Suya Bundle',
    badge: 'Best Value!',
    items: [
      {
        id: 'suya-bundle-3',
        name: 'Suya Bundle — 3 Plates',
        description: '3 Suya Plates — You save $10!',
        price: 50.00,
        emoji: '🍢',
        image: DEFAULT_ITEM_IMAGE,
      },
    ],
  },
  {
    id: 'family-sides',
    name: 'Family & Sides',
    items: [
      {
        id: 'family-suya-tray',
        name: 'Family Suya Tray',
        description: 'Generous portion for the family',
        price: 100.00,
        emoji: '🍽️',
        image: DEFAULT_ITEM_IMAGE,
      },
      {
        id: 'family-tray-combo',
        name: 'Family Tray Combo',
        description: 'Suya tray + 8 masa + 6 zobo',
        price: 140.00,
        emoji: '🍽️',
        image: DEFAULT_ITEM_IMAGE,
      },
    ],
  },
  {
    id: 'sides-drinks',
    name: 'Sides & Drinks',
    items: [
      {
        id: 'masa-tray',
        name: 'Masa Tray',
        description: 'Traditional rice cakes — tray size',
        price: 25.00,
        emoji: '🫓',
        image: DEFAULT_ITEM_IMAGE,
      },
      {
        id: 'masa-plate',
        name: 'Masa Plate',
        description: 'Traditional rice cakes — plate size',
        price: 10.00,
        emoji: '🫓',
        image: DEFAULT_ITEM_IMAGE,
      },
      {
        id: 'zobo',
        name: 'Zobo',
        description: 'Traditional hibiscus drink',
        price: 6.00,
        emoji: '🥤',
        image: DEFAULT_ITEM_IMAGE,
      },
    ],
  },
]

// Flat list of all menu items (for cart/order logic)
export const allMenuItems = menuCategories.flatMap((cat) => cat.items)
