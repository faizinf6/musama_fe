
function Comp() {
    return (
        <div className="flex justify-center space-x-4 mt-4">
            <button className="bg-blue-500 text-white font-bold  px-6 py-2 rounded shadow-lg shadow-blue-900">
                Login
            </button>
            <button className="bg-orange-500 text-white font-bold px-6 py-2 rounded shadow-lg shadow-orange-800">
                Daftar
            </button>
            <button className="bg-teal-500 text-white font-bold px-6 py-2 rounded shadow-lg shadow-teal-800">
                Proses
            </button>
            <button className="bg-red-500 text-white font-bold px-6 py-2 rounded shadow-lg shadow-red-800">
                Batal
            </button>
        </div>
    );
}

export default Comp;
