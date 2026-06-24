const u = (id: string) =>
  `https://images.unsplash.com/${id}?w=800&q=80&auto=format&fit=crop`;

export const PLACEHOLDER_IMAGE = "/images/placeholder-food.svg";

export const FOOD_IMAGES = {
  // Sushi sets
  salmonSet:       u("photo-1579871494447-9811cf80d66c"),
  rainbowRoll:     u("photo-1562802378-063ec186a863"),
  californiaRoll:  u("photo-1559410545-0bdcd187e0a6"),
  tunaRoll:        u("photo-1569050467447-ce54b3bbc37d"),
  veggiRoll:       u("photo-1534482421-64566f976cfa"),

  // Nigiri & warm
  salmonNigiri:    u("photo-1553621042-f6e147245754"),
  tunaNigiri:      u("photo-1574781330855-d0db8cc6a79c"),
  gyoza:           u("photo-1496116218417-1a781b1c416c"),
  edamame:         u("photo-1618449840665-9f3a3e56d0a5"),
  misoSoep:        u("photo-1547592180-85f173990554"),

  // Sauzen
  sauceMayo:       "/images/sauces/mayo.svg",
  sauceTomato:     "/images/sauces/tomato.svg",
  sauceCurry:      "/images/sauces/curry.svg",
  sauceSpicy:      "/images/sauces/spicy.svg",
  sauceGarlic:     "/images/sauces/garlic.svg",
  sauceMustard:    "/images/sauces/mustard.svg",
  saucePickle:     "/images/sauces/pickle.svg",
  sauceCocktail:   "/images/sauces/cocktail.svg",

  // Dranken
  thee:            u("photo-1556679343-c7306c1976bc"),
  bier:            u("photo-1608270586620-248524c67de9"),
  cola:            u("photo-1554866585-cd94860890b7"),
  water:           u("photo-1616118132534-381148898bb4"),

  // Hero
  hero: u("photo-1579871494447-9811cf80d66c"),
} as const;
