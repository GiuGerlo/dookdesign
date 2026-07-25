# 0001 — Contacto global desde site_settings

- **Estado**: aceptada
- **Fecha**: 2026-07-25
- **Contexto**: Cada `project` tenía `whatsapp_url` y `email` propios, además de los campos
  globales en `site_settings`. Al planear la página de detalle surgió la pregunta de qué contacto
  mostrar en el CTA. El dueño del portfolio (Agustín) es el mismo para todos los diseños, así que
  el contacto por proyecto no aporta: solo agrega superficie para mantener y para errores.
- **Opciones consideradas**:
  - **A. Mantener contacto por proyecto con fallback a global.** Flexible, pero nadie va a cargar
    contactos distintos por diseño; complejiza el form del admin y el CTA.
  - **B. Contacto único global desde `site_settings`.** Un solo lugar para editar WhatsApp/email.
    Form del admin más simple; CTA siempre construido desde el mismo origen.
- **Decisión**: Opción B. El CTA de cada proyecto usa `site_settings.whatsapp_url` /
  `site_settings.email`. El mensaje de WhatsApp incluye el título del proyecto para dar contexto.
- **Consecuencias**:
  - Migración `0006_drop_project_contact.sql` elimina `projects.whatsapp_url` y `projects.email`.
  - Se quitan esos campos de `projectSchema`, `ProjectForm` y `src/types/database.ts`.
  - Helper `src/lib/site/contact.ts` arma los links (`wa.me` / `mailto`) de forma segura.
  - Deuda: si algún día se quisiera contacto por proyecto, habría que revertir la migración.
