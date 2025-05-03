// FinanceTable.jsx
import React from "react";
import { ArrowUpRight, ArrowDownRight, Edit, Trash, Check, X } from "lucide-react";

const FinanceTable = ({
    financeData,
    editId,
    editForm,
    handleChange,
    handleUpdate,
    cancelEditing,
    startEditing,
    handleDelete,
    userId,
}) => {
    
    return (
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
                <th className="px-4 py-3 rounded-tl-lg">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 rounded-tr-lg">Actions</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            {financeData.length === 0 ? (
                <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                    No transactions found
                </td>
                </tr>
            ) : (
                financeData.map((item,index) => (
                <tr
                    key={index}
                    className={`transition-all duration-300 ${
                    editId === item.id ? "bg-orange-200" : "hover:bg-orange-50"
                    }`}
                >
                    <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        {item.type === "income" ? (
                        <div className="p-2 rounded-lg bg-green-500/20">
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                        </div>
                        ) : (
                        <div className="p-2 rounded-lg bg-red-500/20">
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                        </div>
                        )}
                        <span>{item.type === "income" ? "Income" : "Expense"}</span>
                    </div>
                    </td>

                    {editId?.id === item.id && editId?.index===index ? (
                    <>
                        <td className="px-4 py-3">
                        <select
                            name="category"
                            className="w-full border rounded px-2 py-1"
                            value={editForm.category}
                            onChange={handleChange}
                        >
                            <option value="">Select...</option>
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Misc">Miscellanous</option>
                        </select>
                        </td>
                        <td className="px-4 py-3">
                        <input
                            name="title"
                            className="w-full border rounded px-2 py-1"
                            value={editForm.title}
                            onChange={handleChange}
                        />
                        </td>
                        <td className="px-4 py-3">
                        <input
                            name="amount"
                            type="number"
                            className="w-full border rounded px-2 py-1"
                            value={editForm.amount}
                            onChange={handleChange}
                        />
                        </td>
                        <td className="px-4 py-3">
                        <input
                            name="description"
                            className="w-full border rounded px-2 py-1"
                            value={editForm.description}
                            onChange={handleChange}
                        />
                        </td>
                    </>
                    ) : (
                    <>
                        <td className="px-4 py-3">{item.category}</td>
                        <td className="px-4 py-3">{item.title}</td>
                        <td
                        className={`px-4 py-3 font-medium ${
                            item.type === "income" ? "text-green-600" : "text-red-600"
                        }`}
                        >
                        {`${item.type === "income" ? "+" : "-"}₱${Math.abs(item.amount)}`}
                        </td>
                        <td className="px-4 py-3">{item.description}</td>
                    </>
                    )}

                    <td className="px-4 py-3 text-gray-600">
                    {new Date(item.date).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3">
                    {editId?.id === item.id && editId?.index===index ? (
                        <div className="flex gap-2">
                        <button
                            onClick={() => {
                            handleUpdate(userId, item.id, item.type, editForm, cancelEditing);
                            window.location.reload();
                            }}
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
                            onClick={() => startEditing(item,index)}
                            className="text-blue-500 hover:text-blue-700"
                        >
                            <Edit className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => {
                            handleDelete(userId, item.id, item.type);
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

export default FinanceTable;
