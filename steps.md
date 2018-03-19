# Step by Step

## Scope of Work

* Tiene que saber cual es el directorio en que se esta ejecutando
* lo primero que tiene que hacer es buscar un archivo config.json que es la forma de darse cuenta que es un proyecto.
  * si el archivo `config.json` no existe simplemente retornar un mensaje de que este directorio no contiene un proyecto que si quiere crear uno ejecutar el 
  comando (comando para crear un nuevo proyecto). Si el archivo `config.json` existe continuar con la ejecucion del programa
* crear un proyecto tiene que tener la posibilidad de escoger entre un proyecto en blanco con solo la estructura de archivos o el tema por defecto con los bloques basicos, o en el futuro diferentes temas.
* Al compilar tiene que existir eventos llamados en los momentos claves de la compilacion como son
  * beforeCompile
  * afterCompile
* Antes de compilar cada archivo `*.pug` hay que incluirle los `Pug helpers` que se cargaran desde un achivo.
* El archivo de configuracion tiene que ser recargado en cada modificacion sin tener que reiniciar la aplicacion.

## Pug Helpers

* Un helper para incluir componentes de forma facil como `+component('componentName')` que se cambiara por un include referiendose al nombre del archivo dentro de la carpeta componentes sin necesidad de incluir la extencion.

## Scafolding
---

### Archivos

```
├─── config.json -> Archivo principal y de configuracion del proyecto
├─── index.pug -> Pagina principal
├─── _layouts -> Carpeta que contiene los diferentes layouts
│   ├─── default.pug -> Layout principal del proyecto
├─── __components -> Carpeta que contiene los componentes del proyecto
│   ├─── header.pug -> Header del template default
│   ├─── menu.pug -> Menu del template default
│   ├─── footer.pug -> Footer del template default
├─── _styles -> Carpeta que contiene los estilos del proyecto
│   ├─── main.sass -> Archivo de estilos principal y el unico que se compilara
│   ├─── 1-tools -> Herramientas como fuentes, normalize, margenes
│   ├─── 2-basics -> Estilos basicos como tipografia, el body, botones y links
│   ├─── 3-blocks -> Estilos especificos para los diferentes bloques
│   ├─── 4-pages -> Estilos especificos para las diferentes paginas
├─── _dist -> Carpeta que contiene el proyecto compilado listo para deploy
```

## Configuracion (config.json)

## Comandos

## Naming conventions

* **_:** Los archivos o carpetas que comiencen con _ quedaran excluidos del proceso de compilacion.