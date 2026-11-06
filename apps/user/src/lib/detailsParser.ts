import fs from "fs";
import path from "path";

export interface PolicySection {
  title: string;
  slug: string;
  paragraphs: string[];
}

export function getPolicies(): PolicySection[] {
  try {
    const filePath = path.join(process.cwd(), "src", "app", "(details)", "details.md");
    if (!fs.existsSync(filePath)) {
      console.warn("details.md file not found at " + filePath);
      return [];
    }
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const lines = fileContent.split(/\r?\n/);
    const sections: PolicySection[] = [];
    let currentSection: PolicySection | null = null;

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.includes("=>")) {
        // It's a heading!
        const title = trimmed.replace(/:?=>/, "").trim();
        // Normalize slug: e.g. "Privacy POlicy" -> "privacy-policy"
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        currentSection = {
          title,
          slug,
          paragraphs: [],
        };
        sections.push(currentSection);
      } else if (currentSection) {
        currentSection.paragraphs.push(trimmed);
      }
    }

    return sections;
  } catch (error) {
    console.error("Error reading or parsing details.md:", error);
    return [];
  }
}
