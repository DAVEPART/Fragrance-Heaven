import React from 'react';

const FragranceProfile = ({ longevity, sillage, character, season, occasion }) => {
    const renderBar = (label, value) => {
        const percentage = value === 'Long Lasting' || value === 'Strong' ? 90 :
            value === 'Moderate' ? 60 :
                value === 'Weak' || value === 'Intimate' ? 30 : 50;

        return (
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">{label}</span>
                    <span className="text-xs font-medium text-gray-800">{value}</span>
                </div>
                <div className="h-[2px] w-full bg-gray-100 overflow-hidden">
                    <div
                        className="h-full bg-gray-800 transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    return (
        <div className="py-12 px-8 bg-[#F9F9F9] rounded-sm">
            <h3 className="prata-regular text-xl mb-8 uppercase tracking-widest text-gray-800">Olfactory Profile</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
                <div>
                    {renderBar('Longevity', longevity || 'Moderate')}
                    {renderBar('Sillage', sillage || 'Moderate')}
                </div>

                <div className="space-y-6">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 block mb-2">Character</span>
                        <p className="text-sm text-gray-800 font-medium">{character || 'Woody & Elegant'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 block mb-2">Season</span>
                            <p className="text-sm text-gray-800 font-medium">{season || 'Autumn / Winter'}</p>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 block mb-2">Occasion</span>
                            <p className="text-sm text-gray-800 font-medium">{occasion || 'Evening'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FragranceProfile;
