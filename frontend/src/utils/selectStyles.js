export const selectStyles = {

    control: (provided, state) => ({
        ...provided,
        minHeight: "42px",
        borderRadius: "8px",
        borderColor: state.isFocused ? "#dc2626" : "#d1d5db",
        boxShadow: state.isFocused
            ? "0 0 0 2px rgba(220,38,38,0.15)"
            : "none",
        "&:hover": {
            borderColor: "#dc2626",
        },
    }),

    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? "#dc2626"
            : state.isFocused
                ? "#fef2f2"
                : "#fff",
        color: state.isSelected ? "#fff" : "#374151",
        cursor: "pointer",
    }),

    singleValue: (provided) => ({
        ...provided,
        color: "#111827",
        fontWeight: 500,
    }),

    placeholder: (provided) => ({
        ...provided,
        color: "#9ca3af",
    }),

    dropdownIndicator: (provided, state) => ({
        ...provided,
        color: state.isFocused ? "#dc2626" : "#6b7280",
        "&:hover": {
            color: "#dc2626",
        },
    }),

    indicatorSeparator: () => ({
        display: "none",
    }),

    menu: (provided) => ({
        ...provided,
        borderRadius: "8px",
        overflow: "hidden",
        zIndex: 9999,
    }),

};


/* */

// export const selectStyles = {
//     control: (provided, state) => ({
//         ...provided,
//         minHeight: "42px",
//         borderRadius: "8px",
//         borderColor: state.isFocused ? "#0f172a" : "#d1d5db",
//         boxShadow: state.isFocused
//             ? "0 0 0 2px rgba(15, 23, 42, 0.15)"
//             : "none",
//         "&:hover": {
//             borderColor: "#0f172a",
//         },
//     }),

//     option: (provided, state) => ({
//         ...provided,
//         backgroundColor: state.isSelected
//             ? "#0f172a"
//             : state.isFocused
//             ? "#f1f5f9" // slate-100
//             : "#fff",
//         color: state.isSelected ? "#fff" : "#374151",
//         cursor: "pointer",
//     }),

//     singleValue: (provided) => ({
//         ...provided,
//         color: "#111827",
//         fontWeight: 500,
//     }),

//     placeholder: (provided) => ({
//         ...provided,
//         color: "#9ca3af",
//     }),

//     dropdownIndicator: (provided, state) => ({
//         ...provided,
//         color: state.isFocused ? "#0f172a" : "#6b7280",
//         "&:hover": {
//             color: "#0f172a",
//         },
//     }),

//     indicatorSeparator: () => ({
//         display: "none",
//     }),

//     menu: (provided) => ({
//         ...provided,
//         borderRadius: "8px",
//         overflow: "hidden",
//         zIndex: 9999,
//     }),
// };


/* */
// export const selectStyles = {
//     control: (provided, state) => ({
//         ...provided,
//         minHeight: "42px",
//         borderRadius: "8px",
//         borderColor: state.isFocused ? "#7B0C1B" : "#d1d5db",
//         boxShadow: state.isFocused
//             ? "0 0 0 2px rgba(15, 23, 42, 0.15)"
//             : "none",
//         "&:hover": {
//             borderColor: "#7B0C1B",
//         },
//     }),

//     option: (provided, state) => ({
//         ...provided,
//         backgroundColor: state.isSelected
//             ? "#7B0C1B"
//             : state.isFocused
//             ? "#7B0C1B1A" // slate-100
//             : "#fff",
//         color: state.isSelected ? "#fff" : "#374151",
//         cursor: "pointer",
//     }),

//     singleValue: (provided) => ({
//         ...provided,
//         color: "#111827",
//         fontWeight: 500,
//     }),

//     placeholder: (provided) => ({
//         ...provided,
//         color: "#9ca3af",
//     }),

//     dropdownIndicator: (provided, state) => ({
//         ...provided,
//         color: state.isFocused ? "#7B0C1B" : "#6b7280",
//         "&:hover": {
//             color: "#7B0C1B",
//         },
//     }),

//     indicatorSeparator: () => ({
//         display: "none",
//     }),

//     menu: (provided) => ({
//         ...provided,
//         borderRadius: "8px",
//         overflow: "hidden",
//         zIndex: 9999,
//     }),
// };