import PropTypes from 'prop-types';
import React from 'react';
import { Input } from '@components/common/form/fields/Input';
import './Pagination.scss';

export default function Pagination({ total, limit, page }) {
  const pageInput = React.useRef(null);
  const limitInput = React.useRef(null);

  React.useEffect(() => {
    pageInput.current.value = page;
    limitInput.current.value = limit;
  }, []);

  const onKeyPress = (e) => {
    if (e.which !== 13) return;
    e.preventDefault();
    let pageNumber = parseInt(e.target.value, 10);
    if (page < 1) pageNumber = 1;
    if (page > Math.ceil(total / limit)) pageNumber = Math.ceil(total / limit);
    const url = new URL(document.location);
    url.searchParams.set('page', pageNumber);
    window.location.href = url.href;
  };

  const onPrev = (e) => {
    e.preventDefault();
    const prev = page - 1;
    if (page === 1) return;
    const url = new URL(document.location);
    url.searchParams.set('page', prev);
    window.location.href = url.href;
  };

  const onNext = (e) => {
    e.preventDefault();
    const next = page + 1;
    if (page * limit >= total) return;
    const url = new URL(document.location);
    url.searchParams.set('page', next);
    window.location.href = url.href;
  };

  const onFirst = (e) => {
    e.preventDefault();
    if (page === 1) return;
    const url = new URL(document.location);
    url.searchParams.delete('page');
    window.location.href = url.href;
  };

  const onLast = (e) => {
    e.preventDefault();
    if (page === Math.ceil(total / limit)) return;
    const url = new URL(document.location);
    url.searchParams.set('page', Math.ceil(total / limit));
    window.location.href = url.href;
  };

  const onKeyPressLimit = (e) => {
    if (e.which !== 13) return;
    e.preventDefault();
    const limitNumber = parseInt(e.target.value, 10);
    if (limit < 1) return;
    const url = new URL(document.location);
    url.searchParams.set('limit', limitNumber);
    window.location.href = url.href;
  };

  return (
    <div className="pagination flex px-2">
      <div className="flex justify-between w-full space-x-1 mt-1 mb-1">
        <div className="flex space-x-1">
          <div className="self-center">
            <span>Show</span>
          </div>
          <div className="limit">
            <div className="" style={{ width: '5rem' }}>
              <Input onKeyPress={(e) => onKeyPressLimit(e)} ref={limitInput} />
            </div>
          </div>
          <div className="self-center">
            <span>per page</span>
          </div>
        </div>
        <div className="flex space-x-1">
          {page > 1 && (
            <div className="prev self-center">
              <a href="#" onClick={(e) => onPrev(e)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </a>
            </div>
          )}
          <div className="first self-center">
            <a href="#" onClick={(e) => onFirst(e)}>
              1
            </a>
          </div>
          <div className="current" style={{ width: '5rem' }}>
            <Input ref={pageInput} onKeyPress={(e) => onKeyPress(e)} />
          </div>
          <div className="last self-center">
            <a href="#" onClick={(e) => onLast(e)}>
              {Math.ceil(total / limit)}
            </a>
          </div>
          {page * limit < total && (
            <div className="next self-center">
              <a href="#" onClick={(e) => onNext(e)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          )}
          <div className="self-center">
            <span>{total} records</span>
          </div>
        </div>
      </div>
    </div>
  );
}

Pagination.propTypes = {
  limit: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired
};
