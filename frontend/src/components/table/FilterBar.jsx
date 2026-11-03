import styles from "./styles/FilterBar.module.css"
import ActiveFilters from "./ActiveFilters";
import TextInput from "../ui/TextInput";

const FilterBar = ({
    searchValue,
    onSearchChange,
    toggleSearch,
    actions,
    extraActions,
    activeFilters,
    filterOptions,
    onFilterChange
}) => {

    function handleSearchChange(e) {
        onSearchChange(e.target.value)
    }

    return (
        <div className={styles.filterBar}>
            <div className={styles.filterFlex}>
                <div className={styles.leftSection}>
                    {toggleSearch && (
                        <div className={styles.filterGroup}>
                            {/* <label className={styles.filterLabel}>Search</label>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchValue}
                                onChange={handleSearchChange}
                                className={styles.searchInput}
                            /> */}
                            <TextInput 
                                id="search"
                                label="Search"
                                labelPlacement="none"
                                value={searchValue} 
                                onChange={handleSearchChange} 
                                placeholder="Search..."
                                style={{
                                    minWidth: "320px",
                                    maxWidth: "450px",
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className={styles.rightSection}>
                    {actions}
                    {extraActions}
                </div>
            </div>

            <ActiveFilters 
                activeFilters={activeFilters}
                filterOptions={filterOptions}
                onFilterChange={onFilterChange}
            />
        </div>
    );
};

export default FilterBar;