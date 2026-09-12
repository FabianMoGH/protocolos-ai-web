# protocolos-ai-web · Asistente público TramaClínicaMed v1

Sitio estático existente, con un único chat público compartido por los botones **Preguntale al Asistente** del hero y **Asistente TramaClínicaMed** flotante. Está disponible en `/` y `/protocolos/`. Ambos accesos de cada página abren el mismo panel y conversación; cerrar el panel no la borra. Una recarga o navegación a otro documento inicia una conversación nueva. No se usa almacenamiento del navegador ni base de datos.

## Desarrollo y verificación

Node >=22.16, npm. No hay framework nuevo ni SDK de OpenAI: se usa fetch server-side. Wrangler es sólo dependencia de desarrollo, fijada con lockfile.

```sh
npm ci
npm test
npm run check:public
npm run dev
```

La web conserva la publicación estática de la raíz del repositorio, igual que `main`: no usa Vite, `dist` ni un comando de build de Cloudflare Pages. `check:public` inspecciona los HTML y assets que se sirven desde la raíz y comprueba que no contengan claves, variables OpenAI ni referencias a su API. `npm run dev` es sólo una herramienta local: sirve esa misma raíz con Pages Functions.

Cloudflare Pages detecta `functions/api/chat.js` por enrutado basado en archivos y lo publica como `POST /api/chat`. El archivo raíz `_routes.json` limita la invocación de Functions a esa ruta; todos los demás recursos se sirven como estáticos. La carpeta `functions` no es un asset público.

El proyecto usa JavaScript: no tiene un typecheck de TypeScript. La compilación de Wrangler y `npm test` validan el backend. No hay script de lint.

## Variables del backend

Configurar en Cloudflare Pages → Settings → Variables and Secrets, por separado en Preview/Production cuando se autorice. No configuradas por esta implementación.

| Nombre | Uso |
| --- | --- |
| `OPENAI_API_KEY` | **Secret**, leído sólo en `context.env` por la Pages Function. Nunca en HTML, assets ni variables con prefijo público. |
| `OPENAI_CHAT_MODEL` | Modelo elegido explícitamente por el operador, compatible con Responses y File Search. No hay modelo predeterminado. |
| `OPENAI_VECTOR_STORE_ID` | ID `vs_…` del vector store dedicado a la biblioteca pública. |

Para pruebas locales reales, copiar `.dev.vars.example` a `.dev.vars` y editarlo localmente. Está ignorado por Git. No pegar la clave en conversaciones ni versionarla. Sin las tres variables el endpoint responde 503, sin invocar OpenAI.

## Biblioteca pública y sincronización

`docs/rag-publico/` contiene los 11 documentos 00–10 y el README del paquete oficial `tramaclinicamed_rag_publico_v1.zip` proporcionado por el responsable del producto. Los 12 Markdown se extrajeron sin modificar su contenido y se verificaron byte por byte contra el ZIP. `.gitattributes` evita conversiones de fin de línea en esa carpeta. El sincronizador incluye los 12 archivos como base documental oficial. No mezclar documentos privados en este directorio o vector store.

```sh
# Sin credenciales, sin red y sin costo:
npm run rag:sync -- --dry-run

# Después de autorizar la carga: copiar .env.rag.example a .env.rag,
# configurar OPENAI_API_KEY localmente y ejecutar:
npm run rag:sync
```

Primera ejecución: usa el ID configurado; si no existe, recupera el ID del estado local o un store previamente creado por este sincronizador. Si ninguno existe, crea **TramaClinicaMed Public RAG**. Sube los Markdown, los asocia, espera la indexación y verifica el conjunto final. Termina con `OPENAI_VECTOR_STORE_ID=vs_…`: copiar ese ID a la configuración server-side de Pages y a `.env.rag` para actualizaciones explícitas.

Futuras ejecuciones: compara nombre y SHA-256 en los atributos remotos. Archivos sin cambios no se vuelven a subir. Tras indexar todo correctamente, desvincula del store las versiones anteriores administradas por este script. Rechaza stores con archivos ajenos. No elimina archivos de la cuenta OpenAI porque podrían tener otras referencias: la limpieza de objetos Files antiguos requiere revisión aparte.

`.rag-sync/state.json` guarda únicamente IDs y estado técnico, nunca claves ni conversaciones. Permite reanudar una subida pendiente; está fuera de Git y de los archivos estáticos. Un lock impide dos ejecuciones en esta misma carpeta. No ejecutar sincronizadores desde dos máquinas simultáneamente. Si un proceso muere, verificar que terminó antes de retirar el lock huérfano. Ante un timeout ambiguo de subida puede quedar un objeto Files sin asociación; revisar en OpenAI, sin repetir a ciegas. No hay transacción remota: el reemplazo se realiza después de indexar, pero puede existir una breve coexistencia de versiones mientras se sincroniza. Hacer actualizaciones en ventana controlada.

Los errores se informan con estado HTTP o nombre/código de indexación, sin volcar credenciales ni cuerpos de respuesta. Timeout de 60 s por solicitud y 5 min de indexación por archivo. Un fallo no elimina las versiones previas.

## Endpoint y límites

`POST /api/chat`, mismo origen, JSON `{ "message": "…", "history": [] }`. Historial sólo con pares `user`/`assistant`, sin roles ni configuración privilegiados del cliente.

- Mensaje: 2.000 caracteres. Hasta 12 turnos previos y 14.000 caracteres de historial; cuerpo HTTP máximo 80 KB.
- Responses: modelo y único vector store desde variables server-side, herramienta `file_search` obligatoria, máximo 5 resultados recuperados y 1.400 tokens de salida. Sin búsqueda web ni herramientas de escritura.
- Timeout OpenAI: 55 s, incluida la lectura de respuesta; cliente: 65 s. No hay reintentos automáticos que generen cobros duplicados.
- Sin evidencia recuperada se devuelve un mensaje de información insuficiente. No se ofrece una respuesta de producto sin consultar File Search.
- Throttle best-effort de 10 solicitudes/minuto por IP resumida criptográficamente, en memoria del isolate. No es un límite global ni defensa suficiente contra abuso distribuido. Antes de exponer el endpoint, revisar límites de gasto de OpenAI y reglas WAF/rate limiting de Cloudflare. No se han configurado servicios remotos.

`store:false`, respuestas HTTP `no-store`, sin logs propios de prompts ni base de conversaciones. El proveedor recibe el mensaje y el contexto reciente; esto no implica retención técnica cero por todos los proveedores. El chat avisa no enviar información clínica/personal. Las instrucciones de alcance no son un filtro infalible de datos sensibles: texto que un visitante envíe puede llegar a OpenAI. El asistente no se conecta a Supabase ni tiene acceso a la aplicación médica.

## Pruebas

`npm test` usa mocks de OpenAI: validación, origen, configuración, alcance de File Search, errores, timeout, límites y sincronización idempotente. No genera costos.

Con `npm run dev` en 5185, ejecutar mediante Playwright CLI:

```sh
playwright-cli open http://127.0.0.1:5185/
playwright-cli run-code --filename tests/assistant-browser-check.js
```

La prueba de UI intercepta `/api/chat` y devuelve respuestas ficticias. Comprueba ambos accesos, conversación conservada, historial, cierre durante carga, errores, texto sin ejecutar HTML y móvil. Las capturas quedan en `output/playwright`, excluidas de Git.

## Estado y activación pendiente

Implementado y verificable localmente. No se han subido documentos, creado vector stores, generado respuestas reales ni desplegado. Para activar: aprobar la biblioteca y modelo; autorizar `rag:sync`; configurar las tres variables; probar con OpenAI real en Preview; revisar controles de abuso; autorizar por separado el despliegue de Pages. No es necesario modificar Supabase.

Referencias técnicas oficiales: [File Search](https://developers.openai.com/api/docs/guides/tools-file-search), [archivos de vector store](https://developers.openai.com/api/reference/resources/vector_stores/subresources/files), [rutas de Pages Functions](https://developers.cloudflare.com/pages/functions/routing/), [variables y secretos](https://developers.cloudflare.com/pages/functions/bindings/), [desarrollo local](https://developers.cloudflare.com/pages/functions/local-development/).
