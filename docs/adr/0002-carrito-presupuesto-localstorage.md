# 0002 — Carrito de presupuesto en cliente (localStorage), sin backend ni pagos

- **Estado**: aceptada
- **Fecha**: 2026-07-28
- **Contexto**: Agustín quiere que el visitante pueda juntar varios productos (por color y
  cantidad) y pedir un presupuesto de una, en vez del WhatsApp suelto por producto. Surgieron
  dos preguntas de arquitectura: (1) dónde vive el estado del carrito y (2) si el pedido implica
  cobro/checkout. Esto último toca la política de Vercel Hobby (uso no comercial): un checkout
  con pagos empujaría el sitio a "comercial" y sube el riesgo de aviso/takedown.
- **Opciones consideradas**:
  - **Estado del carrito**
    - **A. Tabla en Supabase + sesión.** Persistente entre dispositivos, pero exige identificar
      al visitante (auth o cookie de sesión), endpoints y RLS. Mucho para un carrito anónimo que
      termina en un mensaje de WhatsApp.
    - **B. localStorage + store cliente (`useSyncExternalStore`).** Cero backend, cero PII en DB,
      persiste en el navegador. Nativo de React 18/19, sin dependencia ni Provider.
  - **Cierre del pedido**
    - **C. Checkout con pasarela de pago.** Comercial pleno → choca con Hobby, agrega superficie
      (pagos, PII, seguridad) que el negocio hoy no necesita.
    - **D. Generar un mensaje de WhatsApp con el detalle.** El pedido lo cierra Agustín por chat,
      como ya venía haciendo. Sin pagos, sin datos sensibles.
- **Decisión**: **B + D**. El carrito es 100% cliente (localStorage, key `dook_cart`) vía un store
  con `useSyncExternalStore`; el botón "Pedir presupuesto" arma un deep link `wa.me` con el detalle
  (producto/color/cantidad + lugar de envío) al número de `site_settings.whatsapp_url`. Sin pagos
  ni checkout. Se sigue en Vercel Hobby asumiendo el riesgo bajo de un aviso eventual (sin caída
  súbita); si el proyecto factura, upgrade a Pro.
- **Consecuencias**:
  - No hay tabla de carrito ni endpoints: menos superficie, nada de PII persistida. El único dato
    del visitante (lugar de envío) viaja en el mensaje de WhatsApp, no se guarda.
  - Como el mensaje se abre en pestaña nueva, **no se puede saber si el visitante realmente envió**
    → el vaciado del carrito es **manual** (estado de confirmación en el drawer). Deuda conocida.
  - El carrito no sincroniza entre dispositivos ni pestañas (localStorage local). Aceptable; si
    hiciera falta multi-tab, agregar un listener de `storage`.
  - Colores: nueva columna `projects.colors` (jsonb, migración `0021`) con
    `{ hex, name, render }`; cada color se asocia a un render existente y en el detalle mueve el
    carrusel. Si el proyecto tiene colores, elegir uno es obligatorio para agregar al carrito.
  - Se reemplaza el botón WhatsApp directo del detalle por el flujo de carrito (el contacto por
    email queda; el WhatsApp general sigue en el footer).
