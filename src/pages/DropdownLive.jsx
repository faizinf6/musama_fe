import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/solid';

export const DropdownLive = ({ label, value, options, onChange }) => (
    <div className="my-2">
        <label className="block mb-1 font-semibold">{label}</label>
        <div className="relative">
            <select
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:shadow-outline"
                value={value}
                onChange={e => onChange(e.target.value)}>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
            </div>
        </div>
    </div>
);