param(
    [Parameter(Mandatory = $true)][string]$InputPath,
    [Parameter(Mandatory = $true)][string]$OutputPath
)

$rows = Import-Csv -LiteralPath $InputPath
if ($rows.Count -eq 0) {
    throw "Input CSV contains no company records."
}

if ($rows[0].PSObject.Properties.Name -contains 'Address / Country') {
    throw "Input CSV already contains Address / Country."
}

$adapted = foreach ($row in $rows) {
    $ordered = [ordered]@{}
    foreach ($property in $row.PSObject.Properties) {
        $ordered[$property.Name] = $property.Value
    }
    $ordered['Address / Country'] = ''
    [pscustomobject]$ordered
}

$adapted | Export-Csv -LiteralPath $OutputPath -NoTypeInformation -Encoding utf8
