import { getMenus } from "./services/menu.service";

// Función para procesar la estructura de menú jerárquico en formato plano
const processMenuTree = async (menuData) => {
  // Array final de elementos de menú
  const resultItems = [];
  
  // Verificación básica de la estructura de datos
  if (!menuData || !menuData.menuTree || !Array.isArray(menuData.menuTree) || menuData.menuTree.length === 0) {
    return resultItems;
  }
  
  // Procesar el elemento Dashboard (primer elemento del menuTree)
  const dashboard = menuData.menuTree[0];
  if (dashboard && dashboard.href === 'CNavItem' && dashboard.estatus === 1) {
    // Añadir el Dashboard como primer elemento
    resultItems.push({
      component: 'CNavItem',
      name: dashboard.name,
      to: dashboard.url,
      icon: dashboard.icon || null,
      badge: dashboard.badge_text ? {
        color: dashboard.badge_variant || 'info',
        text: dashboard.badge_text
      } : null
    });
  }
  
  // Procesar los hijos del Dashboard (secciones y sus elementos)
  if (dashboard && dashboard.children && Array.isArray(dashboard.children)) {
    // Para cada sección (Registros, Administración)
    dashboard.children.forEach(section => {
      // Añadir el título de sección si es un CNavTitle
      if (section.href === 'CNavTitle' && section.estatus === 1) {
        resultItems.push({
          component: 'CNavTitle',
          name: section.name
        });
        
        // Procesar los hijos de la sección
        if (section.children && Array.isArray(section.children)) {
          section.children.forEach(item => {
            if (item.estatus !== 1) return; // Omitir ítems inactivos
            
            // Si es un grupo, procesar con sus sub-elementos
            if (item.href === 'CNavGroup') {
              const navGroup = {
                component: 'CNavGroup',
                name: item.name,
                to: item.url,
                icon: item.icon || null,
                items: []
              };
              
              // Añadir los elementos del grupo
              if (item.children && Array.isArray(item.children)) {
                item.children.forEach(subItem => {
                  if (subItem.estatus !== 1) return;
                  
                  // Por defecto, asumimos que es un CNavItem si no se especifica href
                  navGroup.items.push({
                    component: subItem.href === 'CNavGroup' ? 'CNavGroup' : 'CNavItem',
                    name: subItem.name,
                    to: subItem.url || '',
                    icon: subItem.icon || null,
                    
                  });
                });
              }
              
              resultItems.push(navGroup);
            } 
            // Si es un elemento simple
            else {
              resultItems.push({
                component: 'CNavItem',
                name: item.name,
                to: item.url || '',
                icon: item.icon || null,
              });
            }
          });
        }
      }
    });
  }
  
  return resultItems;
};

/*const getDynamicSidebarNav = async () => {
  try {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (!token || !storedUser) return []
    
    const response = await getMenus(token)
    console.log("Menú cargado:", response)
    return await processMenuTree(response)
  } catch (err) {
    console.error("Error al cargar el menú:", err)
    return []
  }
}*/

export const fetchNavItems = () => async (dispatch) => {
  try {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token || !storedUser) {
      // Si no hay token o usuario, asegurarse de limpiar los ítems
      dispatch({ type: 'SET_NAV_ITEMS', navItems: [] });
      return;
    }

    // Verificar si ya hay ítems en localStorage
    const storedNavItems = localStorage.getItem('navItems');
    if (storedNavItems) {
      dispatch({ 
        type: 'SET_NAV_ITEMS',
        navItems: JSON.parse(storedNavItems)
      });
    }

    // Siempre intentar actualizar desde el servidor
    const response = await getMenus(token);
    const menuItems = await processMenuTree(response);

    if (menuItems.length > 0) {
      localStorage.setItem('navItems', JSON.stringify(menuItems));
      dispatch({ 
        type: 'SET_NAV_ITEMS',
        navItems: menuItems
      });
    }
  } catch (error) {
    console.error("Error loading menu:", error);
    // Si hay error, mantener los ítems almacenados si existen
    const storedNavItems = localStorage.getItem('navItems');
    if (storedNavItems) {
      dispatch({ 
        type: 'SET_NAV_ITEMS',
        navItems: JSON.parse(storedNavItems)
      });
    }
  }
};

/*const navigation = await getDynamicSidebarNav()
export default navigation*/