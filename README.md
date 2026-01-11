# 🎵 Riff Valley Front

## 📋 Requisitos

- **Node.js ≥ 20**  
  Se recomienda instalarlo con [nvm](https://github.com/nvm-sh/nvm) o [nvm-windows](https://github.com/coreybutler/nvm-windows).  
- **Yarn (v4 o superior)**  
  Viene incluido con `corepack` en Node.js.

---


## 🚀 Instalación

Clona el repositorio y en la raíz del proyecto ejecuta:

```bash
corepack enable
yarn install --immutable
```

Esto instalará todas las dependencias usando el `yarn.lock` incluido en el proyecto.

---

## 🛠️ Desarrollo

Para iniciar el servidor de desarrollo:

```bash
yarn dev
```

Por defecto estará disponible en `http://localhost:5173/`.

---

## 🏗️ Build de producción

Genera la build optimizada en la carpeta `dist/`:

```bash
yarn build
```

---

## 👀 Vista previa de la build

Para probar localmente el resultado de la build:

```bash
yarn preview
```

---

## ✍️ Convenciones de commits

Este proyecto usa [Conventional Commits](https://www.conventionalcommits.org).  
Todos los commits deben seguir este formato:

```
<tipo>(<scope>): <descripción>
```

### Tipos permitidos
- **feat** → nueva funcionalidad  
- **fix** → corrección de bug  
- **docs** → cambios en documentación  
- **style** → cambios de formato (espacios, comas, etc., sin afectar la lógica)  
- **refactor** → cambios en el código que no corrigen errores ni añaden funcionalidades  
- **perf** → mejoras de rendimiento  
- **test** → añadir o modificar tests  
- **build** → cambios en el sistema de build o dependencias  
- **ci** → cambios en la configuración de CI  
- **chore** → mantenimiento general, sin afectar código de producción  
- **revert** → revertir un commit previo  

### Ejemplos
```bash
feat(auth): añade login con Google
fix(ui): corrige padding en el header
docs(readme): añade guía de instalación
refactor(api): simplifica validación de usuarios
```
-
### Breaking Changes
Si un cambio rompe compatibilidad, márcalo de una de estas formas:

```bash
feat(api)!: elimina el endpoint /users/old
```

o con un footer:

```
feat(api): elimina el endpoint /users/old

BREAKING CHANGE: los clientes deben usar /users/v2
```

Esto hará que la versión suba a **major** automáticamente (ej: de `1.2.3` → `2.0.0`).
