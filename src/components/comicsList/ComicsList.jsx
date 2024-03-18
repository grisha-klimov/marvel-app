import { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';
import useMarvelService from '../../services/MarvelService';

import './comicsList.scss';

const setContent = (process, Component, newItemLoading) => {
    switch(process) {
        case 'waiting':
            return <Spinner/>;
            break;
        case 'loading':
            return newItemLoading ? <Component/> : <Spinner/>;
            break;
        case 'confirmed':
            return <Component/>;
            break;
        case 'error':
            return <ErrorMessage/>;
            break;
        default:
            throw new Error('Unexpected process state');
    }
}

const ComicsList = () => {

    const [comicList, setComicList] = useState([]);
    const [newItemLoading, setNewItemLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [comicEnded, setComicEnded] = useState(false);

    const {loading, error, getAllComics, process, setProcess} = useMarvelService();

    useEffect(() => {
        onRequest(offset, true);
    }, [])
    
    const onRequest = (offset, initial) => {
        initial ? setNewItemLoading(false) : setNewItemLoading(true);
        getAllComics(offset)
            .then(onComicListLoaded)
            .then(() => setProcess('confirmed'));
    }

    const onComicListLoaded = (newComicList) => {
        let ended = false;
        if(newComicList.length < 8) {
            ended = true;
        }

        setComicList(comicList => [...comicList, ...newComicList]);
        setNewItemLoading(false);
        setOffset(offset => offset + 8);
        setComicEnded(comicEnded => ended);
    }


    function renderItems (arr) {
        const items  = arr.map((item, i) => {
            const {name, thumbnail, price} = item;

            return (
                <li className="comics__item"
                    key={i}
                    >
                    <Link to={`/comics/${item.id}`}>
                        <img src={thumbnail} alt={name} className='comics__item-img'/>
                        <div className="comics__item-name">{name}</div>
                        <div className="comics__item-price">{price}</div>
                    </Link>
                </li>
            )
        });

        return (
            <ul className="comics__grid">
               {items}
            </ul>
        )
    }

    return (
        <div className="comics__list">
            {setContent(process, () => renderItems(comicList), newItemLoading)}
            <button 
                className="button button__main button__long"
                disabled={newItemLoading}
                style={{ 'display' : comicEnded ? 'none' : 'block' }}
                onClick={() => onRequest(offset)}
                >
                <div className="inner">load more</div>
            </button>
        </div>
    )
}

export default ComicsList;