import { HStack, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import { font, foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

/**
 * Per-team collection progress widget. Props are pushed from the app via
 * `syncWidget()` in src/lib/widget.ts — keep both types in sync. Each widget
 * instance is configured to one team through the static `teamId` enum
 * parameter declared in app.json; changing the list requires a new binary.
 * The plugin codegens enum values into a Swift enum, so they must be Swift
 * identifiers: values are seed team IDs with '-' replaced by '_', decoded
 * here by normalizing team IDs the same way before comparing.
 */

export type WidgetTeamProgress = {
  id: string;
  name: string;
  ownedKits: number;
  totalKits: number;
  ownedItems: number;
};

export type KitsWidgetProps = {
  teams: WidgetTeamProgress[];
};

type KitsWidgetConfig = {
  teamId?: string;
};

const KitsWidgetComponent = (
  props: KitsWidgetProps,
  environment: WidgetEnvironment<KitsWidgetConfig>,
) => {
  "widget";
  // The 'widget' directive makes expo-widgets ship this function to the
  // widget extension as a source string, evaluated in a JS context where only
  // globals exist — every value it uses must be defined inside the function.
  const GOLD = "#efc200";
  const MUTED = "#c6c6cd";
  const teams = props.teams ?? [];
  const selectedId = environment.configuration?.teamId;
  const team =
    teams.find((t) => t.id.replace(/-/g, "_") === selectedId) ?? teams[0];

  if (!team) {
    return (
      <VStack>
        <Text modifiers={[font({ weight: "bold", size: 14 })]}>KitArchive</Text>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(MUTED)]}>
          Add your first shirt
        </Text>
      </VStack>
    );
  }

  return (
    <VStack>
      <HStack>
        <Text modifiers={[font({ weight: "bold", size: 14 })]}>
          {team.name}
        </Text>
        <Spacer />
      </HStack>
      <Spacer />
      <HStack>
        <Text
          modifiers={[
            font({ weight: "heavy", size: 32 }),
            foregroundStyle(GOLD),
          ]}
        >
          {String(team.ownedKits)}
        </Text>
        <Text modifiers={[font({ size: 16 }), foregroundStyle(MUTED)]}>
          {` / ${team.totalKits}`}
        </Text>
        <Spacer />
      </HStack>
      <HStack>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(MUTED)]}>
          {`kits collected · ${team.ownedItems} shirts`}
        </Text>
        <Spacer />
      </HStack>
    </VStack>
  );
};

export default createWidget<KitsWidgetProps, KitsWidgetConfig>(
  "HomeWidget",
  KitsWidgetComponent,
);
