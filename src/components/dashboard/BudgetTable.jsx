import React from "react";
import { Edit, Trash, Check, X } from "lucide-react";

const BudgetTable = ({
    budgetData,
    editId,
    editForm,
    handleChange,
    handleUpdate,
    cancelEditing,
    startEditing,
    onDelete,
    userId,
}) => {
    console.log('budgetData:', budgetData);
    // Handle update directly (without local state)
    const handleUpdateClick = (id, updatedForm) => {
        handleUpdate(userId, id, updatedForm, cancelEditing);
    };

    

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Month</th>
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3 ">Description</th>
                        <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {budgetData.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                                No budget entries found
                            </td>
                        </tr>
                    ) : (
                        budgetData.map((item, index) => (
                            <tr 
                            key={index} 
                            className="hover:bg-orange-50 transition-all">
                                <td className="px-4 py-3 font-medium">
                                    {`${item.month} ${item.year}`}
                                </td>
                                <td className="px-4 py-3">
                                    {editId?.id === item.id && editId?.index === index ? (
                                        <input
                                            name="title"
                                            className="w-full border rounded px-2 py-1"
                                            value={editForm.title}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        item.title
                                    )}
                                </td>
                                <td className="px-4 py-3 text-blue-600 font-semibold">
                                    {editId?.id === item.id && editId?.index === index ? (
                                        <input
                                            name="amount"
                                            type="number"
                                            className="w-full border rounded px-2 py-1"
                                            value={editForm.amount}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        `₱${Number(item.amount).toFixed(2)}`
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {editId?.id === item.id && editId?.index === index ? (
                                        <input
                                            name="description"
                                            className="w-full border rounded px-2 py-1"
                                            value={editForm.description}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        item.description
                                    )}
                                </td>

                                <td className="px-4 py-3">
                                    {editId?.id === item.id && editId?.index === index ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdateClick(item.id, editForm)}
                                                className="text-green-500 hover:text-white hover:bg-green-500 rounded-full p-1 transition-all duration-200"
                                            >
                                                <Check className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="text-red-500 hover:text-white hover:bg-red-500 rounded-full p-1 transition-all duration-200"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => startEditing(item, index)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                onDelete(userId, item.id);
                                                window.location.reload();    
                                                }}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default BudgetTable;
