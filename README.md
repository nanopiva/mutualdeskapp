<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

</head>
<body>
  <h1>MutualDesk</h1>
  <p>
    MutualDesk es un editor de texto en línea que permite a los usuarios trabajar en proyectos de forma colaborativa y en tiempo real. 
    Ofrece funcionalidades como gestión de proyectos, creación de grupos, y conexión con amigos mediante un sistema de invitaciones.
  </p>

  <h2>Características Principales</h2>
  <ul>
    <li><strong>Edición Colaborativa:</strong> Trabaja en proyectos simultáneamente con otros usuarios.</li>
    <li><strong>Gestión de grupos:</strong> Permite a varias personas trabajar en diversos proyectos con acceso compartido.</li>
    <li><strong>Gestión de amigos:</strong> Facilita la conexión con personas para colaboraciones recurrentes.</li>
  </ul>

  <h2>Estructura de la Aplicación</h2>
  <h3>Página Principal</h3>
  <ul>
    <li><strong>Proyectos Públicos:</strong> Lista de proyectos disponibles para todos los usuarios registrados.</li>
    <li><strong>Resumen de Funcionalidades:</strong> Introducción a las capacidades de la aplicación.</li>
  </ul>

  <h3>Páginas accesibles a través del Sidebar</h3>
  <ul>
    <li><strong>My Projects:</strong>
      <ul>
        <li>Proyectos en Grupo: Proyectos vinculados a grupos del usuario.</li>
        <li>Proyectos Individuales: Proyectos propios del usuario, compartidos o no.</li>
      </ul>
    </li>
    <li><strong>Groups:</strong>
      <ul>
        <li>Muestra los grupos del usuario.</li>
        <li>Flecha extensible para:
          <ul>
            <li>Crear un nuevo grupo.</li>
            <li>Acceder a la página de cada grupo.</li>
          </ul>
        </li>
        <li><strong>Página del Grupo:</strong>
          <ul>
            <li>Añadir Miembros: Modal para agregar usuarios mediante email y rol.</li>
            <li>Listado de Proyectos del Grupo.</li>
            <li>Invitaciones Pendientes del Grupo.</li>
          </ul>
        </li>
      </ul>
    </li>
    <li><strong>Friends:</strong> Lista de amigos del usuario.</li>
    <li><strong>Invitations:</strong>
      <ul>
        <li>Invitaciones pendientes de amistad, grupo o proyecto.</li>
        <li>Permite aceptarlas o rechazarlas.</li>
      </ul>
    </li>
    <li><strong>Settings:</strong> Sección actualmente sin funcionalidad implementada.</li>
    <li><strong>Logout:</strong> Botón para cerrar sesión en el dispositivo.</li>
  </ul>

  <h3>Header</h3>
  <p>
    Ícono de perfil en la esquina superior derecha que despliega un menú con la opción <strong>Profile</strong> para:
  </p>
  <ul>
    <li>Cambiar foto de perfil.</li>
    <li>Editar nombre, apellido y contraseña.</li>
  </ul>

  <h2>Tecnologías Usadas</h2>
  <ul>
    <li><strong>Frontend:</strong> React.js con Next.js.</li>
    <li><strong>Backend:</strong> Supabase para bases de datos y autenticación.</li>
    <li><strong>Estilo:</strong> Diseñado con módulos de CSS, sin librerías externas como Tailwind.</li>
    <li><strong>Realtime:</strong> Supabase channels.</li>
  </ul>

  <h2>Instalación</h2>
  <ol>
    <li>Clona este repositorio:
      <pre><code>git clone https://github.com/nanopiva/mutualdeskapp</code></pre>
    </li>
    <li>Instala las dependencias:
      <pre><code>npm install</code></pre>
    </li>
    <li>Configura las variables de entorno en un archivo <code>.env</code>.</li>
    <li>Inicia el proyecto:
      <pre><code>npm run dev</code></pre>
    </li>
  </ol>

  <h2>Contribución</h2>
  <p>Si deseas contribuir, abre un <em>issue</em> o envía un <em>pull request</em> con tus mejoras.</p>

  <h2>Licencia</h2>
  <p>Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.</p>
</body>
</html>
