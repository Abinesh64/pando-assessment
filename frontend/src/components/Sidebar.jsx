const SideBar = () => {
  const sidebarList = [
    {
      name: "Photos",
      path: "/photos",
    },
    {
      name: "Trash",
      path: "/trash",
    },
    {
      name: "Albums",
      path: "/albums",
    },
  ];
  return (
    <div className="sidebar">
      {sidebarList.map((item) => (
        <a key={item.name} href={item.path} className="sidebar-link">
          {item.name}
        </a>
      ))}
    </div>
  );
};

export default SideBar;
