import React, {useEffect, useState} from "react";
import {useSearchContext} from "./components/search-context/search-context";
import {IconButton, InputBase} from "@mui/material";
import styles from "./components/market-place-grid/market-place-grid.module.scss";
import SearchIcon from "@mui/icons-material/Search";

export const Search: React.FC = () => {
    const {setSearch} = useSearchContext()
    const [displayedSearch, setDisplayedSearch] = useState("")
    const [isInputVisible, setInputVisible] = useState(false);
    useEffect(() => {
        setSearch(new RegExp(`^.*${displayedSearch}.*$`, 'i'))
    }, [displayedSearch, setSearch]);
    return <>
        {isInputVisible && (<InputBase
            value={displayedSearch}
            onChange={(event) => {
                setDisplayedSearch(event.target.value)
            }}
            placeholder="Search..."
            className={styles.search}
        />)}
        <IconButton className={styles.search} onClick={() => {
            setInputVisible(!isInputVisible)
        }}>
            <SearchIcon/>
        </IconButton>
    </>
}