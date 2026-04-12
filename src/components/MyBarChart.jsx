import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts';

export default function MyBarChart({ data, dataKey, labelKey = "name" }) {
    return (
        <div style={{ width: "100%", height: 300}}>
            <ResponsiveContainer>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey={labelKey}
                        tick={{ fontSize: 12}}
                        />

                    <YAxis />

                    <Tooltip />

                    <Bar 
                        dataKey={dataKey}
                        radius={[8, 8, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}