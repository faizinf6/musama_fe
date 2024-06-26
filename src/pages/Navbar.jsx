import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import logo from '../logo_ppds.png';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './gaya.css';
import baseURL from '../config.js';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await axios.post(`${baseURL}/logout`);
            localStorage.clear();
            navigate('/auth');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <Disclosure as="nav" className="mx-auto px-2 sm:px-6 lg:px-8 w-full bg-green-900">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                        <div className="relative flex h-16 items-center justify-between">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                {/* Mobile menu button*/}
                                <Disclosure.Button id="id2" className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-green-600 hover:text-white">
                                    <span className="absolute -inset-0.5" />
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>
                            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="flex flex-shrink-0 items-center" onClick={() => navigate('/beranda')}>
                                    <img className="h-10 w-auto" src={logo} alt="Darussaadah" />
                                </div>
                                <div className="hidden sm:ml-6 sm:block">
                                    <div className="space-y-1 px-2 pb-3 pt-2">
                                        <NavigationLink route="/beranda" name="Beranda" currentPath={location.pathname} />
                                        <NavigationLink route="/live-absensi" name="Live Absensi Santri " currentPath={location.pathname} />
                                        <NavigationLink route="/panel-admin" name="Panel Admin" currentPath={location.pathname} />
                                        <NavigationLink route="/profil" name="Akun" currentPath={location.pathname} />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                {/* Profile dropdown */}
                                <Menu as="div" className="relative ml-3">
                                    <div>
                                        <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm">
                                            <span className="absolute -inset-1.5" />
                                            <span className="sr-only">Open user menu</span>
                                            <UserCircleIcon className="h-8 w-8 rounded-full bg-amber-50" alt="" />
                                        </Menu.Button>
                                    </div>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <a
                                                        onClick={() => navigate('/profil')}
                                                        className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                                    >
                                                        {JSON.parse(localStorage.getItem('user')).nama_admin || 'Pengguna'}
                                                    </a>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <a
                                                        onClick={handleLogout}
                                                        className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700 z-40')}
                                                    >
                                                        Keluar
                                                    </a>
                                                )}
                                            </Menu.Item>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                        </div>
                    </div>
                    <Disclosure.Panel className="sm:hidden ">
                        <div className="space-y-1 px-2 pb-3 pt-2">
                            <NavigationLink route="/beranda" name="Beranda" currentPath={location.pathname} />
                            <NavigationLink route="/live-absensi" name="Live Absensi S " currentPath={location.pathname} />
                            <NavigationLink route="/panel-admin" name="Panel Admin" currentPath={location.pathname} />
                            <NavigationLink route="/profil" name="Akun" currentPath={location.pathname} />
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
}

function NavigationLink({ route, name, currentPath }) {
    return (
        <Link
            to={route}
            className={classNames(
                currentPath === route ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-green-600 hover:text-white',
                'rounded-md px-3 py-2 text-sm font-medium'
            )}
        >
            {name}
        </Link>
    );
}
