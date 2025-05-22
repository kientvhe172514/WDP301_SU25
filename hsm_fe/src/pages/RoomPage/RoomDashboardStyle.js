import styled from "styled-components";
import { Card } from "antd";

export const RoomDashboardContainer = styled.div`
    padding: 24px;
    background: #f0f2f5;
`;

/* --- GRID ROOM LIST --- */
export const RoomGrid = styled.div`
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const Rooms = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
    padding: 16px;
`;

export const Room = styled.div`
    padding: 16px;
    border-radius: 8px;
    text-align: center;
    color: white;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    div {
        font-weight: bold;
        margin-bottom: 4px;
    }

    small {
        opacity: 0.8;
    }
`;

/* --- CALENDAR & FILTER SECTION --- */
export const FilterSection = styled.div`
    background: white;
    padding: 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

/* --- LEGEND STYLES --- */
export const Legend = styled.div`
    margin-top: 24px;
    padding: 16px;
    background: white;
    border-radius: 8px;
    display: flex;
    gap: 24px;
    justify-content: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const StatsCard = styled(Card)`
    text-align: center;
    .ant-card-body {
        padding: 16px;
    }
    
    h3 {
        color: ${props => props.color || '#000'};
        margin: 0;
        font-size: 24px;
    }
    
    p {
        margin: 8px 0 0;
        color: rgba(0, 0, 0, 0.45);
    }
`;
