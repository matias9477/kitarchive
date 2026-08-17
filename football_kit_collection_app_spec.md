# Football Kit Collection App — Product & Domain Specification

## 1. Product Overview

### Working concept

A mobile app for football-shirt collectors to catalogue, manage, browse, and grow their collections.

The primary personal use case is a collector who owns many football shirts—initially focused on Boca Juniors and Argentina—and sometimes cannot remember exactly which shirts are already owned when considering a new purchase.

The app should answer questions such as:

- What shirts do I own?
- Do I already own this exact shirt?
- How many copies of this kit do I own?
- What variants of a kit do I own?
- Which kits am I missing?
- Which kits do I want to buy?
- What condition is each physical shirt in?
- When and where did I buy it?
- What does the actual shirt I own look like?
- What catalogue kits exist even if I don't own them?

The product is intended primarily as a personal collector tool, but its underlying model should be designed well enough that it could later support other collectors and a broader public catalogue.

---

# 2. Product Principles

## 2.1 Catalogue-first, collection-second

The app should maintain a structured catalogue of football teams, seasons/kit cycles, competitions, and kits.

A user should not have to create arbitrary text such as:

> "Boca 2006 home shirt"

every time they add a shirt.

Instead, the app should already know that a catalogue entry exists for:

> Boca Juniors → 2006/07 → Home

The user's physical shirts then exist as collection items attached to that catalogue kit.

This distinction is fundamental.

---

## 2.2 A Kit is not a physical shirt

A **Kit** represents the catalogue/model/design.

A **Collection Item** represents one physical shirt owned by the user.

Example:

### Catalogue

Boca Juniors  
2006/07  
Home

### Collection

- Item #1 — original, fan version, blank, short sleeve, Very Good condition
- Item #2 — original, player version, Riquelme #10, short sleeve, Excellent condition

Both physical shirts belong to the same catalogue Kit.

If the user owns two completely identical copies, they are still two Collection Items under one Kit.

This avoids duplicating catalogue information and makes duplicate ownership explicit.

---

# 3. Scope

## 3.1 Product scope

The app is specifically about **football shirts/jerseys**.

It does not currently cover:

- Shorts
- Socks
- Full kits
- Training wear
- Jackets
- Pants
- Other football merchandise

The scope is intentionally limited to shirts.

---

## 3.2 Initial catalogue scope

The catalogue should initially support:

### National teams

- Argentina
- A set of approximately the top 10 national teams

The exact initial list can be finalized separately.

### Clubs

- Argentina Primera División

### Special initial focus

Boca Juniors should have deeper/higher-quality historical coverage because it is one of the primary collections.

The architecture must allow additional countries, leagues, clubs, and national teams to be added later without changing the user's collection model.

---

# 4. Core Domain Concepts

The initial domain model should contain the following major concepts:

- Country
- Team
- Team type
- Club season
- National-team kit cycle
- Kit
- Kit type
- Manufacturer
- Competition
- Kit add-on / patch
- Collection Item
- Wishlist Item
- Player
- Image / Media

Some of these may be implemented as lookup/reference entities rather than full user-facing objects, but they are distinct concepts in the domain.

---

# 5. Country

A Country represents a country associated with a national team.

Examples:

- Argentina
- England
- Brazil
- Spain
- Germany

A Country is not necessarily itself a football team.

For example:

> Country: Argentina  
> National Team: Argentina

This distinction leaves room for future teams and competitions.

---

# 6. Team

A Team represents a football organization whose shirts can be catalogued.

A Team has at least:

- Name
- Country
- Team type

Team types:

- Club
- National team

Examples:

### Club

Boca Juniors  
Country: Argentina  
Type: Club

### National team

Argentina  
Country: Argentina  
Type: National team

The model must not assume that all teams use the same season structure.

---

# 7. Seasons and National-Team Kit Cycles

This is an important domain distinction.

## 7.1 Clubs

Club shirts generally follow football seasons.

Example:

> Boca Juniors — 2006/07

A club season has:

- Start year
- End year
- Display label

Example:

`2006/07`

The catalogue should support the possibility that a shirt design remains in use for more than one season, but the exact catalogue representation needs to reflect how the shirt is historically classified.

---

## 7.2 National teams

National teams should NOT be forced into a club-style season model.

National-team shirts can remain in use across multiple calendar years.

Example:

> England Umbro 2004–06

This is a meaningful kit cycle even though it is not a club-style `2004/05` season.

Therefore national teams should support a **kit cycle** with:

- Start year
- End year
- Display label

Example:

`2004–06`

This allows a shirt design to span multiple competitions and years.

---

## 7.3 Competitions are separate

Competitions do not define the kit itself.

For example:

> England 2004–06 Home

can be associated with:

- Euro 2004
- World Cup 2006 qualifying
- World Cup 2006

The competition is contextual metadata.

Likewise:

> Argentina 2022 Home

may be associated with:

- World Cup 2022

The competition should not automatically create a different Kit.

---

# 8. Kit

A Kit represents the base football shirt design in the catalogue.

A Kit belongs to:

- One Team
- One season or national-team kit cycle
- One Kit Type

A Kit can have:

- Manufacturer
- Reference images
- Description
- Competition associations
- Available information about the design

Examples:

> Boca Juniors — 2006/07 — Home

> Boca Juniors — 2006/07 — Away

> Argentina — 2022 — Home

> England — 2004–06 — Home

---

# 9. Kit Types

The catalogue should support at least:

- Home
- Away
- Third
- Goalkeeper
- Special
- Commemorative
- Championship

The exact list may evolve as historical catalogue research is performed.

A Kit Type describes the base role/design of the shirt.

---

# 10. Kit vs Special Edition vs Add-On

This is one of the most important domain rules and should be kept simple.

## Proposed rule

If the underlying shirt design is materially the same, it remains the same **Kit**.

Things such as:

- Competition patches
- Champion patches
- Finals patches
- World champion patches
- Copa América patches
- World Cup patches
- Anniversary patches
- Special front/back markings
- Tournament-specific markings

should generally be represented as **Add-ons / Patches** rather than separate Kits.

Example:

### Base Kit

Boca Juniors  
2000/01  
Home

### Collection Item

Boca 2000/01 Home

- Libertadores patch

The underlying Kit remains:

> Boca 2000/01 Home

The patch is an additional property of the physical Collection Item.

---

## 10.1 When should something become a different Kit?

A shirt should be represented as a separate Kit when the underlying shirt design is materially different.

Examples could include:

- Different base design
- Different color arrangement
- Different primary pattern
- Officially distinct Home/Away/Third design
- Distinct special-edition shirt with a substantially different design

This rule intentionally avoids creating dozens of catalogue entries for patch combinations.

The exact boundary should be tested against real historical examples during catalogue population.

---

# 11. Competition

A Competition represents a football competition associated with a Kit or an Add-on/Patch.

Examples:

- Copa Libertadores
- World Cup
- Copa América
- UEFA Euro
- Argentine Primera División

A Competition can be associated with a Kit without making it a separate Kit.

Example:

> Boca Juniors 2000/01 Home  
> Competition association: Copa Libertadores

A specific shirt can additionally have:

> Copa Libertadores patch

Competition is therefore both useful as catalogue metadata and as context for physical-shirt add-ons.

---

# 12. Add-ons / Patches

An Add-on is a modification or additional element applied to a base Kit.

Examples:

- Copa Libertadores patch
- World Cup patch
- Copa América patch
- World Champion patch
- Championship patch
- Final patch
- Anniversary marking
- Special player/tournament marking

An Add-on should have enough information to describe what was added without duplicating the underlying Kit.

Potential fields:

- Name
- Type
- Competition
- Description
- Reference image

Examples:

> Add-on: Copa Libertadores patch  
> Competition: Copa Libertadores

> Add-on: World Champion patch  
> Competition: World Cup

---

# 13. Manufacturer

Manufacturer should be a structured catalogue property.

Examples:

- Nike
- Adidas
- Umbro
- Reebok
- Topper

Manufacturer belongs primarily to the Kit because it describes the base product.

---

# 14. Product Version / Authenticity

"Original vs replica" should be represented separately from whether the shirt is a fan or player version.

Suggested product-version concepts:

- Original
- Replica
- Authentic / Player
- Match-issued
- Match-worn

Important terminology:

**Original** means the shirt is a genuine/licensed product rather than a fake.

**Replica** means the lower-tier/fan retail product; colloquially this may be called "trucha" in the user's terminology, but the app should use professional terminology.

The app should not collapse:

- Original vs Replica

with:

- Fan vs Player

These are separate dimensions.

---

# 15. Sleeve Type

Supported values:

- Short sleeve
- Long sleeve

Sleeveless shirts, if encountered, can initially be treated as short sleeve for simplicity.

---

# 16. Back Customization

A physical Collection Item can have a customized back.

Supported states should include:

- Blank
- Player name + number
- Custom name + number
- Number only

Optional fields:

- Player
- Number
- Custom name

Example:

> Riquelme — 10

The Player should be a structured entity when possible, rather than storing only arbitrary text.

---

# 17. Player

A Player represents a footballer whose name/number can appear on a shirt.

Potential fields:

- Name
- Full name
- Team associations
- Optional historical metadata

For MVP, the most important use is selecting a player when adding a shirt.

Example:

> Boca Juniors 2000/01 Home  
> Player: Juan Román Riquelme  
> Number: 10

---

# 18. Collection Item

A Collection Item is one physical shirt owned by the user.

This is the central personal-data object.

Each Collection Item belongs to exactly one Kit.

Potential fields:

### Required

- Kit
- Condition

### Optional

- Product version
- Sleeve type
- Player
- Name
- Number
- Add-ons / patches
- Condition note
- Purchase date
- Seller
- Purchase price
- Currency
- Photos
- Status

---

# 19. Condition

Instead of a numeric 1–10 rating, the app should use standardized condition categories.

Proposed values:

1. Deadstock
2. Excellent
3. Very Good
4. Good
5. Fair
6. Poor

The user can additionally provide a free-text condition note.

Example:

> Condition: Very Good  
> Note: Small mark near lower left side.

The condition system should be consistent throughout the application.

---

# 20. Purchase Information

Purchase information is optional.

The user should be able to record only the information they know.

Minimum useful field:

- Purchase date

Optional:

- Seller
- Purchase price
- Currency

Example:

> Purchased: 12 March 2024

or:

> Purchased: 12 March 2024  
> Seller: Classic Football Shirts  
> Price: €120

---

# 21. Purchase Price and Historical Currency

Purchase price should be supported in the data model even if it is not a major V1 feature.

Store:

- Amount
- Currency

Do NOT rely on historical nominal prices for meaningful comparison.

For example, a shirt bought as a child in Argentina for ARS should retain its original amount/currency, but the app should not treat that amount as directly comparable to today's EUR prices.

The app should not attempt automatic historical inflation conversion in the initial product.

---

# 22. Collection Item Images

Images are important.

There are two fundamentally different types of images:

## 22.1 Reference images

These represent the catalogue Kit.

They show what the shirt model looks like.

They belong to the Kit.

A Kit can have multiple reference images.

Potential sources:

- Catalogue-provided images
- Images found online
- Other reference imagery

---

## 22.2 User photos

These represent the user's actual physical Collection Item.

A Collection Item can have multiple photos.

Examples:

- Front
- Back
- Tag
- Detail
- Damage/condition
- Player name/number
- Patch

The user should be able to:

- Take a photo
- Select photos from the device
- Add multiple photos

The UI should clearly distinguish catalogue/reference imagery from photos of the user's actual shirt.

---

# 23. Image Discovery

When adding a shirt, the user should have an easy way to identify the correct catalogue Kit.

The desired experience is:

1. Select/search the Kit
2. See reference imagery
3. Confirm that it is the correct shirt
4. Add the physical Collection Item
5. Optionally take/upload photos of the user's actual shirt

The app may also support finding reference images online.

The exact image-search provider/implementation is a technical concern and is intentionally outside this product specification.

---

# 24. Wishlist

The Wishlist contains specific catalogue Kits the user wants to acquire.

Example:

> Boca Juniors — 2000/01 — Away

The wishlist is not simply free-text.

It should reference the structured catalogue Kit.

A wishlist entry may optionally specify desired configuration details such as:

- Product version
- Sleeve type
- Player
- Name
- Number
- Notes

Example:

> Wishlist: Boca Juniors 2000/01 Away  
> Desired: Riquelme #10

However, the base wishlist concept remains the Kit itself.

---

# 25. Wishlist vs Collection

A Kit can have both states:

- Owned
- Wishlist

For example:

> Boca 2000/01 Away

could be:

> Wishlist: Yes  
> Owned: No

After purchase:

> Wishlist: No  
> Owned: Yes

A user can also own a Kit while still wanting another version/copy.

Example:

> Own Boca 2000/01 Away — blank

and:

> Want Boca 2000/01 Away — Riquelme #10

This is why wishlist configuration details may be useful.

---

# 26. Sold Collection Items

A Collection Item can be marked as sold.

Proposed statuses:

- Owned
- Sold

The user should also be able to delete an item.

The product should avoid cluttering the normal collection view with sold items.

Sold items should be hidden from the main collection by default.

Whether sold items are retained as historical records should be supported by the data model.

If retained, the user can later view their collection history.

---

# 27. Missing Kits

Missing Kits are different from Wishlist.

Wishlist means:

> "I specifically want this."

Missing means:

> "This exists in the catalogue and I don't currently own it."

Example:

Boca Juniors 2006/07:

- Home — Owned
- Away — Missing
- Third — Missing
- Goalkeeper — Owned

The app should be able to automatically derive missing kits from:

> Catalogue − Owned Kits

The user does not need to manually maintain a missing list.

---

# 28. Collection Progress

The app should provide progress toward completing collections.

Examples:

> Boca Juniors  
> 23 kits owned

or:

> Boca Juniors 2006/07  
> 2 of 4 kits collected

Possible views:

- By team
- By season
- By decade
- By kit type
- By national team
- By competition

The purpose is discovery and motivation rather than gamification-heavy mechanics.

---

# 29. Collection Statistics

The app should provide useful high-level statistics.

Examples:

### Total

- Total physical shirts

### By team

- Boca Juniors
- Argentina
- Other teams

### By type

- Home
- Away
- Third
- Goalkeeper
- Special

### By period

- 1990s
- 2000s
- 2010s
- 2020s

### Condition

- Deadstock
- Excellent
- Very Good
- etc.

### Duplicates

- Kits with multiple physical copies

Statistics should describe the user's actual physical collection.

---

# 30. Catalogue Browsing

The catalogue should be browsable independently of the user's collection.

Example navigation:

Country / Team  
→ Team  
→ Seasons or Kit Cycles  
→ Kits

Example:

Argentina  
→ 2022  
→ Home

Boca Juniors  
→ 2006/07  
→ Home

Each catalogue Kit should visibly communicate the user's status:

- Owned
- Wishlist
- Missing

---

# 31. Search

Global search should support:

- Team
- Season
- Kit
- Player
- Number
- Manufacturer

Results can be grouped into:

- My Collection
- Wishlist
- Catalogue

Search should be optimized for quickly answering:

> "Do I already have this?"

---

# 32. Core User Flows

## Flow 1 — Add an owned shirt

1. Tap Add
2. Search/browse catalogue
3. Select team
4. Select season/cycle
5. Select Kit
6. Confirm reference image
7. Configure physical shirt
8. Set condition
9. Add optional purchase information
10. Add photos
11. Save

The flow should minimize typing.

---

## Flow 2 — Add a duplicate

1. Open existing Kit
2. Tap Add another
3. Configure physical item
4. Add condition/photos/purchase data
5. Save

The user should not need to recreate the Kit.

---

## Flow 3 — Check whether a shirt is already owned

1. Search for team/season/kit
2. Open Kit
3. Immediately see:
   - Owned count
   - Wishlist status
   - Individual owned items

This should be one of the fastest interactions in the app.

---

## Flow 4 — Add to wishlist

1. Find Kit
2. Tap Wishlist
3. Optionally specify desired configuration
4. Save

---

## Flow 5 — Discover missing shirts

1. Open Team
2. Open season/cycle
3. View all Kits
4. See owned vs missing
5. Add missing Kit to wishlist if desired

---

## Flow 6 — Add photos

1. Open/add Collection Item
2. Choose:
   - Take photo
   - Choose photos
3. Add multiple images
4. Save

---

## Flow 7 — Sell a shirt

1. Open Collection Item
2. Select Mark as Sold
3. Confirm
4. Item disappears from normal collection
5. Historical record can remain available

---

# 33. Principal Screens

## 33.1 Home / Dashboard

Purpose:

Give the user an immediate overview of their collection.

Potential content:

- Total shirts
- Team breakdown
- Recently added
- Wishlist count
- Missing/progress highlights
- Collection highlights
- Quick Add action

---

## 33.2 Collection

A visual grid of physical shirts.

Capabilities:

- Search
- Filter
- Sort
- Team
- Season
- Kit type
- Condition

Cards should show enough information to distinguish physical items.

---

## 33.3 Kit Detail

Catalogue-level page.

Example:

> Boca Juniors  
> 2006/07  
> Home

Show:

- Reference images
- Manufacturer
- Kit information
- Competition associations
- Owned count
- Wishlist state
- Individual collection items

Example:

> You own 2

Then:

> Riquelme #10 — Excellent  
> Blank — Very Good

Actions:

- Add another
- Add/remove wishlist

---

## 33.4 Collection Item Detail

Physical-shirt page.

Show:

- User photos
- Kit reference
- Product version
- Sleeve
- Player/name/number
- Add-ons
- Condition
- Condition note
- Purchase date
- Seller
- Purchase price

Actions:

- Edit
- Mark sold
- Delete

---

## 33.5 Add Shirt

The primary creation flow.

It should begin with catalogue selection rather than a giant form.

The user should be able to:

- Search
- Browse
- Select
- Configure
- Photograph
- Save

---

## 33.6 Wishlist

Visual list/grid of desired catalogue Kits.

Show:

- Reference image
- Team
- Season/cycle
- Kit type
- Optional desired configuration

---

## 33.7 Missing / Progress

Show catalogue completion.

Example:

> Boca Juniors — 2006/07

Home ✓  
Away ✕  
Third ✕  
GK ✓

And:

> 2 / 4 collected

---

## 33.8 Explore / Catalogue

Browse the structured database:

Teams  
→ Seasons/Cycles  
→ Kits

Show ownership/wishlist state on catalogue entries.

---

## 33.9 Search

Fast global lookup across:

- Collection
- Wishlist
- Catalogue

---

# 34. Navigation

A simple mobile bottom navigation is appropriate.

Suggested primary destinations:

- Home
- Collection
- Explore
- Wishlist

A prominent Add action should be available globally.

Missing/progress can live inside Collection or Explore rather than necessarily requiring a permanent fifth navigation tab.

---

# 35. UX Principles

## Image-first

Football shirts are highly visual.

Use large, high-quality images and visual grids wherever possible.

---

## Fast identification

The app's highest-value interaction is:

> "Do I already own this?"

The user should be able to answer that in seconds.

---

## Minimal data entry

Do not force the user to fill every field.

Required information should be limited.

Optional information can be progressively disclosed.

---

## Collector mental model

The app should feel like a personal archive/catalogue rather than an inventory management system.

---

## Duplicate clarity

Two physical copies of one Kit should appear as:

> Boca 2006/07 Home — 2 items

rather than as two unrelated catalogue entries.

---

# 36. Catalogue Data Strategy

The initial catalogue should be curated and structured.

Initial priority:

1. Boca Juniors
2. Argentina
3. Argentine Primera División
4. Approximately top 10 national teams

The catalogue should be designed for expansion.

Future additions could include:

- More national teams
- More leagues
- More clubs
- More historical seasons
- More competitions

The application data model should not require schema changes when a new team or league is introduced.

---

# 37. Catalogue Quality

Historical kit information can be ambiguous.

The catalogue should therefore support:

- Multiple reference images
- Notes
- Sources internally if necessary
- Kit cycles spanning multiple years
- Competition associations
- Add-ons/patches
- Uncertainty during catalogue research

The user-facing app should present clean information even if the underlying catalogue contains research metadata.

---

# 38. Future Extensibility

The product should be capable of eventually supporting:

- More teams
- More countries
- More leagues
- Community catalogue contributions
- User accounts
- Cloud synchronization
- Sharing collections
- Public collector profiles
- Collection exports
- Import from spreadsheets
- Collection valuation
- Historical purchase analytics
- Advanced catalogue statistics

These are not required for the initial MVP.

---

# 39. MVP

The first usable version should focus on:

### Catalogue

- Teams
- Club seasons
- National-team kit cycles
- Kits
- Kit types
- Manufacturers
- Competitions
- Basic patches/add-ons
- Reference images

### Collection

- Add physical item
- Multiple items per Kit
- Product version
- Sleeve type
- Player/name/number
- Condition
- Condition notes
- Purchase date
- Optional seller
- Optional price/currency
- Multiple photos
- Sold/delete

### Wishlist

- Add catalogue Kit
- Optional desired configuration
- Remove from wishlist

### Discovery

- Search
- Filters
- Catalogue browsing
- Missing kits
- Collection progress

### Dashboard

- Collection count
- Basic team breakdown
- Recently added
- Wishlist
- Missing/progress highlights

---

# 40. Explicitly Out of Scope for Initial MVP

Do not prioritize:

- Shorts
- Socks
- Training apparel
- Match-worn acquisition workflows
- Market valuation
- Inflation-adjusted historical prices
- Social networking
- Community marketplace
- Buying/selling integrations
- Public profiles
- Advanced financial analytics
- Rarity scores
- Sponsor-level catalogue modeling
- Overly granular manufacturer/product taxonomy

Match-worn can exist as a supported product-version value, but the product does not need special workflows around it.

---

# 41. Important Open Domain Decision

One issue still requires validation before the database schema is considered final:

## Kit vs Add-on boundary

The proposed rule is:

> Same underlying shirt design = same Kit.

Patches, championship marks, competition badges, anniversary marks, and similar additions are Add-ons.

A materially different shirt design becomes a separate Kit.

This should be validated against a set of real examples from:

- Boca Juniors
- Argentina
- England
- Other national teams

before finalizing the catalogue model.

---

# 42. Example End-to-End Data

## Example 1 — Two identical shirts

### Kit

Boca Juniors  
Season: 2006/07  
Type: Home  
Manufacturer: Nike

### Collection Item 1

- Original
- Fan
- Short sleeve
- Blank
- Very Good
- Purchased: 2015
- Photos: 3

### Collection Item 2

- Original
- Fan
- Short sleeve
- Blank
- Excellent
- Purchased: 2024
- Photos: 2

Result:

> Boca Juniors 2006/07 Home — 2 items

---

## Example 2 — Riquelme version

Same Kit:

> Boca Juniors 2006/07 Home

Collection Item:

- Original
- Player
- Short sleeve
- Riquelme
- #10
- Excellent
- Photos

It does NOT create a second Kit.

---

## Example 3 — Competition patch

Base:

> Boca Juniors 2000/01 Home

Physical item:

- Original
- Fan
- Short sleeve
- Blank
- Very Good
- Copa Libertadores patch

The patch is an Add-on.

The Kit remains:

> Boca Juniors 2000/01 Home

---

## Example 4 — National team cycle

### Kit

England  
Kit cycle: 2004–06  
Type: Home  
Manufacturer: Umbro

Competition associations:

- Euro 2004
- World Cup 2006 qualifying
- World Cup 2006

This is not forced into a `2004/05` club-season model.

---

# 43. Product Philosophy

The most important conceptual model for the product is:

> **Catalogue what exists. Track what you own.**

The catalogue represents football-shirt history.

The collection represents the user's physical possessions.

The wishlist represents what the user wants to acquire.

Missing kits are derived from the difference between the catalogue and the collection.

This separation should guide the database, API, UI, and future features.

---

# 44. Success Criteria

The app succeeds if a collector can quickly:

1. Find a specific historical shirt.
2. Know whether they own it.
3. See how many physical copies they own.
4. See the differences between their copies.
5. Add a newly acquired shirt with minimal effort.
6. Photograph and document the actual item.
7. Identify missing shirts from a season/cycle.
8. Add desired shirts to a structured wishlist.
9. Browse their collection visually.
10. Expand their collection without losing track of what they already have.

The product should make the collector feel that their collection is becoming a structured, searchable personal archive rather than a pile of shirts they have to remember manually.
