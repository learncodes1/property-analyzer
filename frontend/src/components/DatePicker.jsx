import React, { useEffect, useRef, useState } from 'react';
import { fetchPropertiesData } from "../api/api";
import DataTable from "./DataTable";
import DataAverage from "./DataAverage";
import Chart from "./PieChart";
import ErrorToast from "./ErrorToast";
import Loading from "./Loading";

const initDate = { start: null, end: null };
const initError = { status: false, loading: false }
function DatePicker() {
    const [dateRange, setDateRange] = useState(initDate);
    const [errorState, setErrorState] = useState(initError)
    const [data, setData] = useState(null)
    const timeoutRef = useRef(null);

    const resetErrorState = () => {
        setErrorState({ ...initError, type: null });
        setData(null)
    };

    const handleDateChange = (date, field) => {
        setDateRange((prevDateRange) => ({
            ...prevDateRange,
            [field]: date,
        }));
    };
    const handleSubmit = async () => {
        resetErrorState();
        if (!dateRange.start || !dateRange.end){
            setErrorState({ ...errorState, status: true, type: 2 });
           return;            
        }
        setErrorState({ ...errorState, loading: true })
        try{
            const res = await fetchPropertiesData(dateRange.start, dateRange.end);
            // eslint-disable-next-line no-unused-expressions
            res.status === 200 ? (setData(res.data), setErrorState({ status: false, loading: false })) : setErrorState({ status: true, type: 3, loading: false }) ? res.status === 404 : setErrorState({ status: true, type: 4, loading: false });
        }catch(error){
            setErrorState({ status: true, type: 3, loading: false })
        }

    }


    useEffect(() => {
         return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (errorState.status) {
             timeoutRef.current = setTimeout(resetErrorState, 3000);
        }
         return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [errorState.status]);


   
    return (
        <>
            <div className="main">
                <h2>Select Start and End Dates</h2>
                <div className="date-picker">
                    <div>
                        <label>Start Date:</label>
                        <input
                            type="date"
                            value={dateRange.start || ''}
                            onChange={(e) => handleDateChange(e.target.value,'start')}
                        />
                    </div>
                    <div>
                        <label>End Date:</label>
                        <input
                            type="date"
                            value={dateRange.end || ''}
                            onChange={(e) => handleDateChange(e.target.value,'end')}
                        />
                    </div>
                    <div>
                        <button type="submit" onClick={handleSubmit}>Select Date Range</button>
                    </div>
                </div>
            </div>
            {errorState.status && <div className="error-toast">
                <ErrorToast type={errorState.type} />
            </div>
            }
            {data && !errorState.loading &&
                <div className="property-data">
                    <div className="data-table">
                        <DataTable data={data} />
                    </div>
                    <div>
                        <DataAverage data={data} />
                        <div>
                            <div className="date-average">
                                <h2>Time Tracked</h2>
                                <Chart data={data} />
                            </div>
                        </div>
                    </div>
                </div>
            }
            {errorState.loading && <Loading />}
        </>
    );
}

export default DatePicker;


