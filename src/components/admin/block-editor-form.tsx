"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

interface BlockEditorFormProps {
  type: string;
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-foreground/70">{children}</label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <select
        value={value || options[0]?.value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent/50 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function RepeatableSection<T extends Record<string, any>>({
  label,
  items,
  onUpdate,
  renderItem,
  defaultItem,
}: {
  label: string;
  items: T[];
  onUpdate: (items: T[]) => void;
  renderItem: (item: T, index: number, update: (field: string, value: any) => void) => React.ReactNode;
  defaultItem: T;
}) {
  const safeItems = Array.isArray(items) ? items : [];

  function addItem() {
    onUpdate([...safeItems, { ...defaultItem }]);
  }

  function removeItem(index: number) {
    onUpdate(safeItems.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: string, value: any) {
    const updated = safeItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onUpdate(updated);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button type="button" variant="ghost" size="sm" onClick={addItem} className="gap-1 h-7">
          <Plus className="h-3 w-3" />
          Afegir
        </Button>
      </div>
      {safeItems.length === 0 && (
        <p className="text-xs text-foreground/30">Cap element. Fes clic a &quot;Afegir&quot; per comenar.</p>
      )}
      {safeItems.map((item, index) => (
        <div key={index} className="relative border border-border/50 rounded-lg p-4 space-y-3 bg-secondary/20">
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="absolute top-2 right-2 p-1 text-foreground/30 hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {renderItem(item, index, (field, value) => updateItem(index, field, value))}
        </div>
      ))}
    </div>
  );
}

export function BlockEditorForm({ type, data, onChange }: BlockEditorFormProps) {
  function update(field: string, value: any) {
    onChange({ ...data, [field]: value });
  }

  switch (type) {
    case "hero":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Titol principal</Label>
            <Input
              value={data.heading || ""}
              onChange={(e) => update("heading", e.target.value)}
              placeholder="Titol del hero"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Subtitol</Label>
            <Input
              value={data.subheading || ""}
              onChange={(e) => update("subheading", e.target.value)}
              placeholder="Subtitol del hero"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Text del boto</Label>
              <Input
                value={data.ctaText || ""}
                onChange={(e) => update("ctaText", e.target.value)}
                placeholder="Comena ara"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Enlla del boto</Label>
              <Input
                value={data.ctaLink || ""}
                onChange={(e) => update("ctaLink", e.target.value)}
                placeholder="/contacte"
              />
            </div>
          </div>
        </div>
      );

    case "rich-text":
      return (
        <div className="space-y-3">
          <div className="rounded-md border border-accent/30 bg-accent/[0.04] p-3 text-xs text-accent/90">
            Aquest bloc s&apos;edita inline al canvas. Clica directament sobre el
            text per començar a escriure; la toolbar de format apareixerà a
            sobre.
          </div>
          <p className="text-xs text-foreground/40">
            Format ric, output HTML net. Suporta negreta, cursiva, encapçalaments,
            llistes, cites, codi i enllaços. DOMPurify sanititza al renderitzar
            al public.
          </p>
        </div>
      );

    case "image":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>URL de la imatge</Label>
            <Input
              value={data.url || ""}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Text alternatiu</Label>
            <Input
              value={data.alt || ""}
              onChange={(e) => update("alt", e.target.value)}
              placeholder="Descripcio de la imatge"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Peu de foto</Label>
            <Input
              value={data.caption || ""}
              onChange={(e) => update("caption", e.target.value)}
              placeholder="Peu de foto (opcional)"
            />
          </div>
        </div>
      );

    case "gallery":
      return (
        <div className="space-y-4">
          <RepeatableSection
            label="Imatges"
            items={data.images || []}
            onUpdate={(images) => update("images", images)}
            defaultItem={{ url: "", alt: "" }}
            renderItem={(item, _index, updateField) => (
              <>
                <div className="space-y-1.5">
                  <Label>URL</Label>
                  <Input
                    value={item.url || ""}
                    onChange={(e) => updateField("url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Text alternatiu</Label>
                  <Input
                    value={item.alt || ""}
                    onChange={(e) => updateField("alt", e.target.value)}
                    placeholder="Descripcio"
                  />
                </div>
              </>
            )}
          />
        </div>
      );

    case "cta":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Titol</Label>
            <Input
              value={data.heading || ""}
              onChange={(e) => update("heading", e.target.value)}
              placeholder="Titol de la crida a l'accio"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Text</Label>
            <Textarea
              value={data.text || ""}
              onChange={(e) => update("text", e.target.value)}
              placeholder="Text descriptiu"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Text del boto</Label>
              <Input
                value={data.buttonText || ""}
                onChange={(e) => update("buttonText", e.target.value)}
                placeholder="Contacta'ns"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Enlla del boto</Label>
              <Input
                value={data.buttonLink || ""}
                onChange={(e) => update("buttonLink", e.target.value)}
                placeholder="/contacte"
              />
            </div>
          </div>
          <SelectField
            label="Estil"
            value={data.style || "default"}
            onChange={(v) => update("style", v)}
            options={[
              { label: "Per defecte", value: "default" },
              { label: "Destacat", value: "highlight" },
              { label: "Minim", value: "minimal" },
            ]}
          />
        </div>
      );

    case "features-grid":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Titol de la seccio</Label>
            <Input
              value={data.heading || ""}
              onChange={(e) => update("heading", e.target.value)}
              placeholder="Les nostres caracteristiques"
            />
          </div>
          <RepeatableSection
            label="Caracteristiques"
            items={data.items || []}
            onUpdate={(items) => update("items", items)}
            defaultItem={{ icon: "", title: "", description: "" }}
            renderItem={(item, _index, updateField) => (
              <>
                <div className="space-y-1.5">
                  <Label>Icona (nom Lucide)</Label>
                  <Input
                    value={item.icon || ""}
                    onChange={(e) => updateField("icon", e.target.value)}
                    placeholder="Zap, Shield, Cloud..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Titol</Label>
                  <Input
                    value={item.title || ""}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Titol de la caracteristica"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Descripcio</Label>
                  <Textarea
                    value={item.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Descripcio"
                    rows={2}
                  />
                </div>
              </>
            )}
          />
        </div>
      );

    case "testimonial":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Cita</Label>
            <Textarea
              value={data.quote || ""}
              onChange={(e) => update("quote", e.target.value)}
              placeholder="La cita del testimoni..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Autor</Label>
              <Input
                value={data.author || ""}
                onChange={(e) => update("author", e.target.value)}
                placeholder="Nom de l'autor"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Carrec</Label>
              <Input
                value={data.role || ""}
                onChange={(e) => update("role", e.target.value)}
                placeholder="CEO"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Empresa</Label>
            <Input
              value={data.company || ""}
              onChange={(e) => update("company", e.target.value)}
              placeholder="Nom de l'empresa"
            />
          </div>
        </div>
      );

    case "stats":
      return (
        <div className="space-y-4">
          <RepeatableSection
            label="Estadistiques"
            items={data.items || []}
            onUpdate={(items) => update("items", items)}
            defaultItem={{ value: "", label: "" }}
            renderItem={(item, _index, updateField) => (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Valor</Label>
                  <Input
                    value={item.value || ""}
                    onChange={(e) => updateField("value", e.target.value)}
                    placeholder="99%"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Etiqueta</Label>
                  <Input
                    value={item.label || ""}
                    onChange={(e) => updateField("label", e.target.value)}
                    placeholder="Satisfaccio"
                  />
                </div>
              </div>
            )}
          />
        </div>
      );

    case "video":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>URL del video</Label>
            <Input
              value={data.url || ""}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Titol (opcional)</Label>
            <Input
              value={data.title || ""}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Titol del video"
            />
          </div>
        </div>
      );

    case "code":
      return (
        <div className="space-y-4">
          <SelectField
            label="Llenguatge"
            value={data.language || "javascript"}
            onChange={(v) => update("language", v)}
            options={[
              { label: "JavaScript", value: "javascript" },
              { label: "TypeScript", value: "typescript" },
              { label: "Python", value: "python" },
              { label: "HTML", value: "html" },
              { label: "CSS", value: "css" },
              { label: "JSON", value: "json" },
              { label: "Bash", value: "bash" },
              { label: "SQL", value: "sql" },
              { label: "YAML", value: "yaml" },
            ]}
          />
          <div className="space-y-1.5">
            <Label>Codi</Label>
            <Textarea
              value={data.code || ""}
              onChange={(e) => update("code", e.target.value)}
              placeholder="// El teu codi aqui..."
              rows={12}
              className="font-mono text-sm"
            />
          </div>
        </div>
      );

    case "divider":
      return (
        <div className="space-y-4">
          <SelectField
            label="Estil"
            value={data.style || "solid"}
            onChange={(v) => update("style", v)}
            options={[
              { label: "Solid", value: "solid" },
              { label: "Discontinu", value: "dashed" },
              { label: "Gradient", value: "gradient" },
            ]}
          />
        </div>
      );

    case "accordion":
      return (
        <div className="space-y-4">
          <RepeatableSection
            label="Elements"
            items={data.items || []}
            onUpdate={(items) => update("items", items)}
            defaultItem={{ title: "", content: "" }}
            renderItem={(item, _index, updateField) => (
              <>
                <div className="space-y-1.5">
                  <Label>Titol</Label>
                  <Input
                    value={item.title || ""}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Pregunta o titol"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Contingut</Label>
                  <Textarea
                    value={item.content || ""}
                    onChange={(e) => updateField("content", e.target.value)}
                    placeholder="Resposta o contingut"
                    rows={3}
                  />
                </div>
              </>
            )}
          />
        </div>
      );

    case "pricing":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Titol de la seccio</Label>
            <Input
              value={data.heading || ""}
              onChange={(e) => update("heading", e.target.value)}
              placeholder="Plans i preus"
            />
          </div>
          <RepeatableSection
            label="Plans"
            items={data.tiers || []}
            onUpdate={(tiers) => update("tiers", tiers)}
            defaultItem={{ name: "", price: "", features: "", ctaText: "" }}
            renderItem={(item, _index, updateField) => (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nom del pla</Label>
                    <Input
                      value={item.name || ""}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Basic"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Preu</Label>
                    <Input
                      value={item.price || ""}
                      onChange={(e) => updateField("price", e.target.value)}
                      placeholder="29/mes"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Caracteristiques (una per linia)</Label>
                  <Textarea
                    value={item.features || ""}
                    onChange={(e) => updateField("features", e.target.value)}
                    placeholder="Caracteristica 1&#10;Caracteristica 2&#10;Caracteristica 3"
                    rows={4}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Text del boto</Label>
                  <Input
                    value={item.ctaText || ""}
                    onChange={(e) => updateField("ctaText", e.target.value)}
                    placeholder="Comenar"
                  />
                </div>
              </>
            )}
          />
        </div>
      );

    case "team-grid":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Titol de la seccio</Label>
            <Input
              value={data.heading || ""}
              onChange={(e) => update("heading", e.target.value)}
              placeholder="El nostre equip"
            />
          </div>
          <RepeatableSection
            label="Membres"
            items={data.members || []}
            onUpdate={(members) => update("members", members)}
            defaultItem={{ name: "", role: "", image: "" }}
            renderItem={(item, _index, updateField) => (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nom</Label>
                    <Input
                      value={item.name || ""}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Nom del membre"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Carrec</Label>
                    <Input
                      value={item.role || ""}
                      onChange={(e) => updateField("role", e.target.value)}
                      placeholder="CTO"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>URL de la imatge</Label>
                  <Input
                    value={item.image || ""}
                    onChange={(e) => updateField("image", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </>
            )}
          />
        </div>
      );

    case "contact-form":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Titol</Label>
            <Input
              value={data.heading || ""}
              onChange={(e) => update("heading", e.target.value)}
              placeholder="Contacta amb nosaltres"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Descripcio</Label>
            <Textarea
              value={data.description || ""}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Escriu-nos i et respondrem aviat"
              rows={3}
            />
          </div>
        </div>
      );

    case "logo-grid":
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Titol de la seccio</Label>
            <Input
              value={data.heading || ""}
              onChange={(e) => update("heading", e.target.value)}
              placeholder="Confien en nosaltres"
            />
          </div>
          <RepeatableSection
            label="Logos"
            items={data.logos || []}
            onUpdate={(logos) => update("logos", logos)}
            defaultItem={{ url: "", alt: "" }}
            renderItem={(item, _index, updateField) => (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>URL del logo</Label>
                  <Input
                    value={item.url || ""}
                    onChange={(e) => updateField("url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Text alternatiu</Label>
                  <Input
                    value={item.alt || ""}
                    onChange={(e) => updateField("alt", e.target.value)}
                    placeholder="Nom de l'empresa"
                  />
                </div>
              </div>
            )}
          />
        </div>
      );

    case "spacer":
      return (
        <div className="space-y-4">
          <SelectField
            label="Alada"
            value={data.height || "md"}
            onChange={(v) => update("height", v)}
            options={[
              { label: "Petit (24px)", value: "sm" },
              { label: "Mitja (48px)", value: "md" },
              { label: "Gran (80px)", value: "lg" },
              { label: "Extra gran (120px)", value: "xl" },
            ]}
          />
        </div>
      );

    default:
      return (
        <div className="space-y-4">
          <p className="text-sm text-foreground/50">
            Editor no disponible per al tipus de bloc &quot;{type}&quot;.
          </p>
          <div className="space-y-1.5">
            <Label>Dades (JSON)</Label>
            <Textarea
              value={JSON.stringify(data, null, 2)}
              onChange={(e) => {
                try {
                  onChange(JSON.parse(e.target.value));
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        </div>
      );
  }
}
