Add-Type -AssemblyName System.Drawing

function Draw-EthioHomeIcon([int]$size) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $s = [double]$size / 64.0

    # Draw Green Gradient Circle
    $rect = New-Object System.Drawing.RectangleF(([float](2.0*$s)), ([float](2.0*$s)), ([float](60.0*$s)), ([float](60.0*$s)))
    $c1 = [System.Drawing.Color]::FromArgb(255, 34, 197, 94)   # #22c55e
    $c2 = [System.Drawing.Color]::FromArgb(255, 22, 163, 74)   # #16a34a
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, 55.0)
    $g.FillEllipse($brush, $rect)
    $brush.Dispose()

    # Draw crisp white architectural home
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $points = @(
        (New-Object System.Drawing.PointF(([float](32.0*$s)), ([float](14.5*$s)))),
        (New-Object System.Drawing.PointF(([float](15.0*$s)), ([float](28.0*$s)))),
        (New-Object System.Drawing.PointF(([float](19.5*$s)), ([float](28.0*$s)))),
        (New-Object System.Drawing.PointF(([float](19.5*$s)), ([float](47.0*$s)))),
        (New-Object System.Drawing.PointF(([float](28.0*$s)), ([float](47.0*$s)))),
        (New-Object System.Drawing.PointF(([float](28.0*$s)), ([float](38.0*$s)))),
        (New-Object System.Drawing.PointF(([float](36.0*$s)), ([float](38.0*$s)))),
        (New-Object System.Drawing.PointF(([float](36.0*$s)), ([float](47.0*$s)))),
        (New-Object System.Drawing.PointF(([float](44.5*$s)), ([float](47.0*$s)))),
        (New-Object System.Drawing.PointF(([float](44.5*$s)), ([float](28.0*$s)))),
        (New-Object System.Drawing.PointF(([float](49.0*$s)), ([float](28.0*$s))))
    )
    $path.AddPolygon($points)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillPath($whiteBrush, $path)
    $whiteBrush.Dispose()
    $path.Dispose()

    # Draw Mint Accent Dot
    $mintBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 167, 243, 208)) # #a7f3d0
    $dotSize = [float]([Math]::Max(2.5 * $s, 2.0))
    $dotRect = New-Object System.Drawing.RectangleF(([float](21.5*$s)), ([float](41.5*$s)), $dotSize, $dotSize)
    $g.FillEllipse($mintBrush, $dotRect)
    $mintBrush.Dispose()

    $g.Dispose()
    return $bmp
}

function Save-Ico($bitmaps, [string]$filePath) {
    $pngBytesList = @()
    foreach ($bmp in $bitmaps) {
        $ms = New-Object System.IO.MemoryStream
        $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $pngBytesList += ,$ms.ToArray()
        $ms.Dispose()
    }

    $fs = New-Object System.IO.FileStream($filePath, [System.IO.FileMode]::Create)
    $bw = New-Object System.IO.BinaryWriter($fs)

    # ICO Header: 0, 1 (icon), count
    $bw.Write([UInt16]0)
    $bw.Write([UInt16]1)
    $bw.Write([UInt16]$bitmaps.Count)

    # Calculate offset after directory
    $offset = 6 + (16 * $bitmaps.Count)

    for ($i = 0; $i -lt $bitmaps.Count; $i++) {
        $b = $bitmaps[$i]
        $bytes = $pngBytesList[$i]

        $w = if ($b.Width -ge 256) { [byte]0 } else { [byte]$b.Width }
        $h = if ($b.Height -ge 256) { [byte]0 } else { [byte]$b.Height }

        $bw.Write($w)                    # Width
        $bw.Write($h)                    # Height
        $bw.Write([byte]0)               # Color count
        $bw.Write([byte]0)               # Reserved
        $bw.Write([UInt16]1)             # Planes
        $bw.Write([UInt16]32)            # Bits per pixel
        $bw.Write([UInt32]$bytes.Length) # Image size in bytes
        $bw.Write([UInt32]$offset)       # Image offset

        $offset += $bytes.Length
    }

    # Write image data
    for ($i = 0; $i -lt $bitmaps.Count; $i++) {
        $bw.Write($pngBytesList[$i])
    }

    $bw.Flush()
    $bw.Dispose()
    $fs.Dispose()
}

Write-Output "Rendering EthioHome icons..."

$sizes = @(16, 32, 48, 64, 180, 192, 512)
$bmps = @{}
foreach ($sz in $sizes) {
    $bmps[$sz] = Draw-EthioHomeIcon -size $sz
}

# Save PNGs
$bmps[32].Save("public/favicon-32x32.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmps[48].Save("public/favicon-48x48.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmps[180].Save("public/apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmps[180].Save("src/app/apple-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmps[192].Save("public/icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmps[512].Save("public/icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Save multi-size ICO
$icoBitmaps = @($bmps[16], $bmps[32], $bmps[48])
Save-Ico -bitmaps $icoBitmaps -filePath "src/app/favicon.ico"
Save-Ico -bitmaps $icoBitmaps -filePath "public/favicon.ico"

Write-Output "Successfully generated EthioHome favicon.ico and PNG assets!"
