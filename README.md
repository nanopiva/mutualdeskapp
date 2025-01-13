Descripción General
MutualDesk es un editor de texto en línea que permite a los usuarios trabajar en 
proyectos de forma colaborativa y en tiempo real. Ofrece funcionalidades como 
gestión de proyectos, creación de grupos, y conexión con amigos mediante un sistema 
de invitaciones.
Características Principales
• Edición Colaborativa: Trabaja en proyectos simultáneamente con otros 
usuarios.
• Gestión de grupos: En caso de que varias personas necesiten trabajar en 
diversos proyectos, pueden utilizar la función de grupos que les permite a todos 
sus integrantes un facil acceso a estos.
• Gestión de amigos: Si vas a trabajar varias veces con una persona lo puedes 
añadir como amigo y, en ocasiones posteriores podrás agregarlo a tus proyectos 
de una forma más sencilla.
Estructura de la Aplicación
Página Principal
• Proyectos Públicos: Muestra una lista de proyectos disponibles para todos los 
usuarios registrados.
• Resumen de Funcionalidades: Ofrece una introducción a las capacidades de 
la aplicación.
Páginas accesibles a través del "Sidebar"
El sidebar facilita la navegación entre las secciones principales:
1. My Projects:
a. Proyectos en Grupo: Proyectos vinculados a grupos del usuario.
b. Proyectos Individuales: Proyectos propios del usuario, compartidos o no.
2. Groups:
a. Muestra los grupos del usuario.
b. Flecha extensible para:
i. Crear un nuevo grupo.
ii. Acceder a la página de cada grupo.
c. Página del Grupo:
i. Añadir Miembros: Modal para agregar usuarios mediante email y 
rol.
ii. Listado de Proyectos del Grupo.
iii. Invitaciones Pendientes del Grupo.
3. Friends:
a. Lista de amigos del usuario.
4. Invitations:
a. Muestra invitaciones pendientes de amistad, grupo o proyecto.
b. Permite aceptarlas o rechazarlas.
5. Settings:
a. Sección actualmente sin funcionalidad implementada.
6. Logout:
a. Botón para cerrar sesión en el dispositivo (borra cookies).
Header
• Ícono de perfil en la esquina superior derecha que despliega un menú con la 
opción Profile (única opción que se encuentra habilitada) para:
o Cambiar foto de perfil.
o Editar nombre, apellido y contraseña.
Tecnologías usadas
• Frontend: React.js con Next.js.
• Backend: Supabase para bases de datos y autenticación.
• Estilo: Diseñado con módulos de CSS, sin librerías externas como Tailwind 
(salvo excepciones forzadas de alguna librería en particular).
• Realtime: Supabase channels.
Instalación
1. Clona este repositorio:
git clone https://github.com/nanopiva/mutualdeskapp
2. Instala las dependencias:
npm install
3. Configura las variables de entorno en un archivo .env.
4. Inicia el proyecto:
npm run dev
Contribución
Si deseas contribuir, abre un issue o envía un pull request con tus mejoras.
Licencia
Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.
