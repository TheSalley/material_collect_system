export const getPages = async () => {
    const res = await fetch('http://localhost:8008/pages');
    const data = await res.json();
    return data;
};

export const getPageById = async (id) => {
    const res = await fetch(`http://localhost:8008/elementor/${id}`);
    const data = await res.json();
    return data;
};